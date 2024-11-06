
import { NextFunction, Response } from 'express';
// import { Agent, Client, ServiceProvider } from '@org/db';
import { Booking, RequestWithUser } from '@org/db';
import { addAuditLogJob, ApiError } from '@org/utils';



export const getBooking = async (req: RequestWithUser, res: Response, next: NextFunction) =>  {
  try {
    const { bookingId } = req.params;
    console.log("AAAAAAAAAAAAA",bookingId);

    // Find the booking
    const booking =await  Booking.findById(bookingId)
                    .populate('client', 'name email phone')
                    .populate('agent', 'name email phone')
                    .populate('serviceProvider', 'name email phone');
    return res.status(200).json({ booking });
  } catch (error) {
    return next(new ApiError('Failed to fetch booking', 500));
  }
}

// Show all pending, in-progress, and completed bookings
export const getAgentDashboard = async (req: RequestWithUser, res  : Response , next:NextFunction) => {
  try {
    console.log("AAAAAAAAAAAAA",req.user);
    const agentId = req.user.id;

    console.log("AAAAAAAAAAAAA",agentId);
    // Find all bookings assigned to this agent
    const bookings = await Booking.find({ agent: agentId })
      // .populate('customer', 'name') // Populate customer name for each booking
      // .populate('serviceProvider', 'name'); // Populate service provider name
      // Filter bookings based on status
    const pendingBookings = bookings.filter(b => b.status === 'Pending');
    const inProgressBookings = bookings.filter(b => b.status === 'In Progress');
    const completedBookings = bookings.filter(b => b.status === 'Completed');

    // Send the data for the agent's dashboard
    await addAuditLogJob({
      action: 'FETCH_AGENT_DASHBOARD',
      userId: agentId,
      role: 'AGENT',
      metadata: {
        totalBookings: bookings.length,
        pendingBookings: pendingBookings.length,
        inProgressBookings: inProgressBookings.length,
        completedBookings: completedBookings.length,
      },
      username: req.user.name,
      serviceProviderId: bookings[0].serviceProvider
    });
    return res.status(200).json({
      totalBookings: bookings.length,
      pendingBookings,
      inProgressBookings,
      completedBookings,
    });
  } catch (error) {
    return next(new ApiError('Failed to fetch dashboard data', 500));
  }
};

// 1. Add an Extra Task to a Booking
export const updateBookingStatus = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const agentId = req.user.id;

    // Validate status
    const validStatuses = ['Pending', 'In Progress', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be one of: Pending, In Progress, Completed'
      });
    }

    // Find and validate booking
    const booking = await Booking.findOne({
      _id: bookingId,
      agent: agentId
    });

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found or not assigned to this agent'
      });
    }

    // Validate status transition
    const validTransitions: { [key: string]: string[] } = {
      'Pending': ['In Progress'],
      'In Progress': ['Completed'],
      'Completed': []
    };

    if (!validTransitions[booking.status]?.includes(status)) {
      return res.status(400).json({
        error: `Cannot transition from ${booking.status} to ${status}`
      });
    }

    // Update status
    booking.status = status;
    booking.updatedAt = new Date();
    await booking.save();

    // Add audit log
    await addAuditLogJob({
      action: 'UPDATE_BOOKING_STATUS',
      userId: agentId,
      role: 'AGENT',
      targetId: bookingId,
      metadata: {
        previousStatus: booking.status,
        newStatus: status,
      },
      username: req.user.name,
      serviceProviderId: booking.serviceProvider
    });

    return res.status(200).json({
      message: `Booking status updated to ${status}`,
      booking
    });

  } catch (error) {
    return next(new ApiError('Failed to update booking status', 500));
  }
};

// Add or update extra task with price calculation
export const manageExtraTask = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const { description, extraPrice, taskId } = req.body;
    const agentId = req.user.id;

    // Validate input
    if (!description || !extraPrice || isNaN(Number(extraPrice))) {
      return res.status(400).json({
        error: 'Description and valid extra price are required'
      });
    }

    // Find and validate booking
    const booking = await Booking.findOne({
      _id: bookingId,
      agent: agentId
    });

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found or not assigned to this agent'
      });
    }

    // Don't allow modifications if booking is completed
    if (booking.status === 'Completed') {
      return res.status(400).json({
        error: 'Cannot modify extra tasks for completed bookings'
      });
    }

    let action = 'ADD_EXTRA_TASK';
    // Update existing task or add new one
    if (taskId) {
      const taskIndex = booking.extraTasks.findIndex(task => task._id.toString() === taskId);
      if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
      }
      booking.extraTasks[taskIndex].set({ description, extraPrice });
      action = 'UPDATE_EXTRA_TASK';
    } else {
      booking.extraTasks.push({ description, extraPrice });
    }

    // Calculate total price including extra tasks
    const extraTasksTotal = booking.extraTasks.reduce((sum, task) => 
      sum + Number(task.extraPrice), 0
    );
    
    // Add base price to total if it exists
    const basePrice = booking.totalPrice || 0;
    booking.totalPrice = basePrice + extraTasksTotal;

    // If payment status is Paid, mark as Unpaid due to price change
    if (booking.paymentStatus === 'Paid') {
      booking.paymentStatus = 'Unpaid';
    }

    await booking.save();

    // Add audit log
    await addAuditLogJob({
      action,
      userId: agentId,
      role: 'AGENT',
      targetId: bookingId,
      metadata: {
        description,
        extraPrice,
        newTotalPrice: booking.totalPrice
      },
      username: req.user.name,
      serviceProviderId: booking.serviceProvider
    });

    return res.status(200).json({
      message: `Extra task ${taskId ? 'updated' : 'added'} successfully`,
      booking: {
        ...booking.toObject(),
        totalPrice: booking.totalPrice,
        paymentStatus: booking.paymentStatus
      }
    });

  } catch (error) {
    return next(new ApiError('Failed to manage extra task', 500));
  }
};

// Delete extra task
export const deleteExtraTask = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const { bookingId, taskId } = req.params;
    const agentId = req.user.id;

    // Find and validate booking
    const booking = await Booking.findOne({
      _id: bookingId,
      agent: agentId
    });

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found or not assigned to this agent'
      });
    }

    // Don't allow modifications if booking is completed
    if (booking.status === 'Completed') {
      return res.status(400).json({
        error: 'Cannot delete extra tasks for completed bookings'
      });
    }

    // Find and remove task
    const taskIndex = booking.extraTasks.findIndex(task => 
      task._id.toString() === taskId
    );

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const deletedTask = booking.extraTasks[taskIndex];
    booking.extraTasks.splice(taskIndex, 1);

    // Recalculate total price
    const extraTasksTotal = booking.extraTasks.reduce((sum, task) => 
      sum + Number(task.extraPrice), 0
    );
    
    const basePrice = booking.totalPrice || 0;
    booking.totalPrice = basePrice + extraTasksTotal;

    // If payment status is Paid, mark as Unpaid due to price change
    if (booking.paymentStatus === 'Paid') {
      booking.paymentStatus = 'Unpaid';
    }

    await booking.save();

    // Add audit log
    await addAuditLogJob({
      action: 'DELETE_EXTRA_TASK',
      userId: agentId,
      role: 'AGENT',
      targetId: bookingId,
      metadata: {
        deletedTask,
        newTotalPrice: booking.totalPrice
      },
      username: req.user.name,
      serviceProviderId: booking.serviceProvider
    });

    return res.status(200).json({
      message: 'Extra task deleted successfully',
      booking: {
        ...booking.toObject(),
        totalPrice: booking.totalPrice,
        paymentStatus: booking.paymentStatus
      }
    });

  } catch (error) {
    return next(new ApiError('Failed to delete extra task', 500));
  }
};



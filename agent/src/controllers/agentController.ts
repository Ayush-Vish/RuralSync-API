

// import { Agent, Client, ServiceProvider } from '@org/db';
import { Booking } from '@org/db';
import { addAuditLogJob } from '@org/utils';





// Show all pending, in-progress, and completed bookings
export const getAgentDashboard = async (req, res) => {
  try {
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
    res.status(200).json({
      totalBookings: bookings.length,
      pendingBookings,
      inProgressBookings,
      completedBookings,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// 1. Add an Extra Task to a Booking
export const addExtraTaskToBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { description, extraPrice } = req.body;

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if the agent is allowed to modify this booking
    if (!booking.agent || booking.agent.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to modify this booking' });
    }

    // Add the extra task to the booking
    booking.extraTasks.push({ description, extraPrice });
    booking.updatedAt = new Date();
    await booking.save();
    await addAuditLogJob({
      action: 'ADD_EXTRA_TASK',
      userId: booking.agent,
      role: 'AGENT',
      targetId: bookingId,
      metadata: {
        description,
        extraPrice,
      },
      username: req.user.name,
      serviceProviderId: booking.serviceProvider
    })
    res.status(201).json({
      message: 'Extra task added successfully',
      extraTasks: booking.extraTasks,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add extra task to booking' });
  }
};

// 2. Update an Extra Task in a Booking
export const updateExtraTaskInBooking = async (req, res) => {
  try {
    const { bookingId, taskIndex } = req.params;
    const { description, extraPrice } = req.body;

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if the agent is allowed to modify this booking
    if (!booking.agent || booking.agent.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to modify this booking' });
    }

    // Check if the task index is valid
    if (taskIndex >= booking.extraTasks.length || taskIndex < 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update the specific extra task
    if (description) booking.extraTasks[taskIndex].description = description;
    if (extraPrice) booking.extraTasks[taskIndex].extraPrice = extraPrice;
    booking.updatedAt = new Date();
    await booking.save();
    await addAuditLogJob({
      action: 'UPDATE_EXTRA_TASK',
      userId: booking.agent,
      role: 'AGENT',
      targetId: bookingId,
      metadata: {
        description,
        extraPrice,
      },
      username: req.user.name,
      serviceProviderId: booking.serviceProvider
    })
    res.status(200).json({
      message: 'Extra task updated successfully',
      extraTasks: booking.extraTasks,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update extra task' });
  }
};

// 3. Delete an Extra Task from a Booking
export const deleteExtraTaskFromBooking = async (req, res) => {
  try {
    const { bookingId, taskIndex } = req.params;

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if the agent is allowed to modify this booking
    if (!booking.agent || booking.agent.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this task' });
    }

    // Check if the task index is valid
    if (taskIndex >= booking.extraTasks.length || taskIndex < 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Remove the task at the specified index
    booking.extraTasks.splice(taskIndex, 1);
    await booking.save();
    await addAuditLogJob({
      action: 'DELETE_EXTRA_TASK',
      userId: booking.agent,
      role: 'AGENT',
      targetId: bookingId,
      metadata: {
        taskIndex,
      },
      username: req.user.name,
      serviceProviderId: booking.serviceProvider
    })
    res.status(200).json({ message: 'Extra task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete extra task' });
  }
};

// 4. Get All Extra Tasks of a Booking (for agent's dashboard)
export const getExtraTasksForBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if the agent is allowed to view tasks for this booking
    if (!booking.agent || booking.agent.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view extra tasks' });
    }

    res.status(200).json({ extraTasks: booking.extraTasks });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch extra tasks' });
  }
};





export const updateBookingToInProgress = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const agentId = req.user.id;

    // Find the booking and ensure it belongs to the agent
    const booking = await Booking.findOne({ 
      _id: bookingId,
      agent: agentId 
    });

    if (!booking) {
      return res.status(404).json({ 
        error: 'Booking not found or not assigned to this agent' 
      });
    }

    // Validate current status
    if (booking.status !== 'Pending') {
      return res.status(400).json({ 
        error: 'Booking must be in Pending status to move to In Progress' 
      });
    }

    // Update the status
    booking.status = 'In Progress';
    // booking.startTime = new Date(); // Optional: track when work started
    await booking.save();
    await addAuditLogJob({
      action: 'UPDATE_BOOKING_STATUS',
      userId: agentId,
      role: 'AGENT',
      targetId: bookingId,
      metadata: {
        status: 'In Progress',
      },
      username: req.user.name,
      serviceProviderId: booking.serviceProvider
    })
    res.status(200).json({
      message: 'Booking status updated to In Progress',
      booking
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to update booking status',
      message: error.message 
    });
  }
};

export const updateBookingToCompleted = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const agentId = req.user.id;

    // Find the booking and ensure it belongs to the agent
    const booking = await Booking.findOne({ 
      _id: bookingId,
      agent: agentId 
    });

    if (!booking) {
      return res.status(404).json({ 
        error: 'Booking not found or not assigned to this agent' 
      });
    }

    // Validate current status
    if (booking.status !== 'In Progress') {
      return res.status(400).json({ 
        error: 'Booking must be in In Progress status to move to Completed' 
      });
    }

    // Update the status
    booking.status = 'Completed';
    booking.completionTime = new Date(); // Optional: track when work was completed
    await booking.save();
    await addAuditLogJob({
      action: 'UPDATE_BOOKING_STATUS',
      userId: agentId,
      role: 'AGENT',
      targetId: bookingId,
      metadata: {
        status: 'Completed',
      },
      username: req.user.name,
      serviceProviderId: booking.serviceProvider
    })
    res.status(200).json({
      message: 'Booking status updated to Completed',
      booking
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to update booking status',
      message: error.message 
    });
  }
};


// import { Booking } from '../models/Booking.js';

/**
 * Controller to get a booking by its ID.
 */
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('client', 'name')
      .populate('serviceProvider', 'name')
      .populate('service', 'name')
      .populate('agent', 'name');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.status(200).json({ booking });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get booking',
      message: error.message,
    });
  }
};


/**
 * Controller to change the status of a booking.
 */
export const changeBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'Not Assigned'];

    // Validate provided status
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Find the booking by ID and update status
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = status;

    // Set completion time if status is "Completed"
    if (status === 'Completed') {
      booking.completionTime = new Date();
    }

    await booking.save();

    res.status(200).json({
      message: `Booking status updated to ${status}`,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update booking status',
      message: error.message,
    });
  }
};

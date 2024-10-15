

// import { Agent, Client, ServiceProvider } from '@org/db';
import { Booking, ServiceItem } from '@org/db';





// Show all pending, in-progress, and completed bookings
export const getAgentDashboard = async (req, res) => {
  try {
    const agentId = req.user.id; 

    // Find all bookings assigned to this agent
    const bookings = await Booking.find({ agentId })
      .populate('serviceItems') // Populate service items in each booking
      .populate('customerId', 'name') // Populate customer name for each booking
      .populate('serviceProviderId', 'name'); // Populate service provider name

    // Filter bookings based on status
    const pendingBookings = bookings.filter(b => b.status === 'Pending');
    const inProgressBookings = bookings.filter(b => b.status === 'In Progress');
    const completedBookings = bookings.filter(b => b.status === 'Completed');


    // Send the data for the agent's dashboard
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

// 1. Add a Service to a Booking (as described before)
export const addServiceToBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { description, cost } = req.body; // Description and cost of the service

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if the agent is allowed to modify this booking
    if (!booking.agent || booking.agent.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to modify this booking' });
    }

    // Create a new service item (problem identified by agent)
    const serviceItem = new ServiceItem({
      bookingId,
      description,
      cost, 
      imageUrl: req.file ? req.file.path : null 
    });

    
    await serviceItem.save();

    // Add the service item to the booking
    booking.serviceItems.push(serviceItem._id);
    booking.updatedAt = new Date(); 
    await booking.save();

    res.status(201).json({
      message: 'Service added successfully',
      serviceItem
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add service to booking' });
  }
};

// 2. Update a Service for a Booking
export const updateServiceInBooking = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { description, cost } = req.body; 
    // Find the service item
    const serviceItem = await ServiceItem.findById(serviceId);
    if (!serviceItem) {
      return res.status(404).json({ error: 'Service item not found' });
    }

    // Check if the agent is allowed to modify this service
    const booking = await Booking.findById(serviceItem.bookingId);
    if (booking.agent.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to modify this service' });
    }

    // Update service details
    if (description) serviceItem.description = description;
    if (cost) serviceItem.cost = cost;
    serviceItem.updatedAt = new Date(); 
    await serviceItem.save();

    res.status(200).json({
      message: 'Service updated successfully',
      serviceItem
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service' });
  }
};

// 3. Delete a Service from a Booking
export const deleteServiceFromBooking = async (req, res) => {
  try {
    const { serviceId } = req.params;

   
    const serviceItem = await ServiceItem.findById(serviceId);
    if (!serviceItem) {
      return res.status(404).json({ error: 'Service item not found' });
    }

    // Check if the agent is allowed to delete this service
    const booking = await Booking.findById(serviceItem.bookingId);
    if (booking.agent.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this service' });
    }

    // Remove the service item from the booking's serviceItems array
    booking.serviceItems = booking.serviceItems.filter(
      item => item.toString() !== serviceItem._id.toString()
    );
    await booking.save();

    // Delete the service item
    await ServiceItem.deleteOne({ _id: serviceItem._id });

    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
};

// 4. Get All Services of a Booking (for agent's dashboard)
export const getServicesForBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Find the booking
    const booking = await Booking.findById(bookingId).populate('serviceItems');
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if the agent is allowed to view services for this booking
    if (booking.agent.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view services' });
    }

    res.status(200).json({ services: booking.serviceItems });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

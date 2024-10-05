// import { Client } from "@org/db";
import bcrypt from 'bcrypt';
import { Agent, Client, ServiceProvider } from '@org/db';
// Get Customer Profile
export const getCustomerProfile = async (req, res) => {
  try {
    console.log("bkc" ,req.user)
    const customerId = req.user.id; 

    const customer = await Client.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};








// Update Customer Profile
export const updateCustomerProfile = async (req, res) => {
  try {
    const customerId = req.user.id;  
    const { name, email, phoneNumber, profilePicture } = req.body;

    // Optional validation
    // if (!name || !email || !phoneNumber) {
    //   return res.status(400).json({ message: 'Name, email, and phone number are required' });
    // }

    // Find the customer and update
    const customer = await Client.findByIdAndUpdate(customerId, {
      name,
      email,
      phoneNumber,
      'profile.profilePicture': profilePicture 
    }, { new: true });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};








// Change Password
// Password change function for Service Provider
const changeServiceProviderPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await ServiceProvider.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Service Provider not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: 'Service Provider password changed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred: ' + error.message });
  }
};

// Password change function for Agent
const changeAgentPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await Agent.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: 'Agent password changed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred: ' + error.message });
  }
};

// Password change function for Client
const changeClientPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await Client.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: 'Client password changed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred: ' + error.message });
  }
};

// Main changePassword function that handles different roles
export const changePassword = async (req, res, next) => {
  try {
    const { role } = req.body;

    // Check for role and call the respective function
    switch (role) {
      case 'SERVICE_PROVIDER':
        return await changeServiceProviderPassword(req, res, next);
      case 'AGENT':
        return await changeAgentPassword(req, res, next);
      case 'CLIENT':
        return await changeClientPassword(req, res, next);
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred: ' + error.message });
  }
};

// queue.js
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import axios from 'axios';

// Connect to Redis
const connection = new IORedis({
      host: 'localhost',
      port: 6379,
      maxRetriesPerRequest: null,
});

// Define the email queue
export const emailQueue = new Queue('emailQueue', { connection });

// Function to add email jobs
export const addEmailJob = async (data) => {
  await emailQueue.add('sendEmail', data);
};

// Worker to process email jobs
new Worker(
  'emailQueue',
  async (job) => {
    const { email, subject, content } = job.data;
      console.log('Sending email to:', email);

    try {
      // Make a request to the email service API to send an email
      const response = await axios.post('http://localhost:5005/email/send', {
        email,
        subject,
        content,
      });
      console.log(response);
      
    } catch (error) {
      throw new Error('Failed to send email');
    }
  },
  { connection }
);

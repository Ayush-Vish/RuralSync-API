import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import axios from 'axios';

// Connect to Redis
const connection = new IORedis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,
});

// Define the email queue with options
export const emailQueue = new Queue('emailQueue', {
  connection,
  defaultJobOptions: {
    attempts: 3,          // Retry job 3 times
    backoff: { type: 'exponential', delay: 5000 }, // Delay between retries
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Function to add email jobs to the queue
export const addEmailJob = async (data) => {
  console.log('Adding email job:', data);
  await emailQueue.add('sendEmail', data);
};

// Worker to process email jobs
const emailWorker = new Worker(
  'emailQueue',
  async (job) => {
    console.log('Processing email job:', job.id , job.data);
    const { email, subject, content } = job.data;

    if (!email || !subject || !content) {
      throw new Error('Email, subject, and content are required');
    }

    console.log('Sending email to:', email);

    try {
      // Make a request to the email service API to send an email
      const response = await axios.post('http://localhost:5005/email/send', {
        email,
        subject,
        content,
      });

      if (response.status !== 200) {
        throw new Error('Failed to send email');
      }

      return response.data;
    } catch (error) {
      console.error(`Error sending email for job ${job.id}:`, error.message);
      throw new Error('Failed to send email');
    }
  },
  { connection }
);

// Event listeners for job failure and completion
emailWorker.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed with error:`, error.message);
});

emailWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

emailWorker.on('error', (error) => {
  console.error('Worker encountered an error:', error.message);
});

emailWorker.on('stalled', (job) => {
  console.warn(`Job ${job} stalled and is being retried`);
});

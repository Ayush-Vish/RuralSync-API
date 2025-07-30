import { Queue, Worker} from 'bullmq';
import IORedis from 'ioredis';
import axios from 'axios';


const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost', 
  port: 6379,
  maxRetriesPerRequest: null,
});


export const emailQueue = new Queue('emailQueue', {
  connection,
  defaultJobOptions: {
    attempts: 3, 
    backoff: { type: 'exponential', delay: 5000 }, 
    removeOnComplete: true,
    removeOnFail: false,
  },
});


export const addEmailJob = async (data) => {
  console.log('Adding email job:', data);
  await emailQueue.add('sendEmail', data);
};


const emailWorker = new Worker(
  'emailQueue',
  async (job) => {
    console.log('Processing email job:', job.id, job.data);
    const { email, subject, content } = job.data;

    if (!email || !subject || !content) {
      throw new Error('Email, subject, and content are required');
    }

    console.log('Sending email to:', email);

    try {
      const response = await axios.post(`${process.env.LOCAL_DOMAIN}:5005/email-service/send`, {
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

// Define the audit log queue
const auditLogQueue = new Queue('auditLogQueue', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Function to add audit log jobs to the queue
export const addAuditLogJob = async (data) => {
  console.log('Adding audit log job:', data);
  await auditLogQueue.add('logAction', data);
};

// Worker to process audit log jobs
const auditLogWorker = new Worker(
  'auditLogQueue',
  async (job) => {
    console.log('Processing audit log job:', job.id, job.data);

    const { userId, role, action, targetId, metadata , username , serviceProviderId } = job.data;

    try {
      const response = await axios.post(`${process.env.LOCAL_DOMAIN}:5006/audit-log/create`, {
        userId,
        role,
        action,
        targetId,
        metadata,
        serviceProviderId,
        username
      });

      if (response.status !== 200) {
        throw new Error('Failed to log audit action');
      }

      console.log(`Audit log job ${job.id} processed successfully`);
      return response.data;
    } catch (error) {
      console.error(`Error logging audit action for job ${job.id}:`, error.message);
      throw new Error('Failed to log audit action');
    }
  },
  { connection }
);

auditLogWorker.on('failed', (job, error) => {
  console.error(`Audit log job ${job.id} failed with error:`, error.message);
});

auditLogWorker.on('completed', (job) => {
  console.log(`Audit log job ${job.id} completed successfully`);
});

auditLogWorker.on('error', (error) => {
  console.error('Audit log worker encountered an error:', error.message);
});

auditLogWorker.on('stalled', (job) => {
  console.warn(`Audit log job ${job} stalled and is being retried`);
});

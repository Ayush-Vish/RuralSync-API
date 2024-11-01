import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER, 
    pass: process.env.GMAIL_APP_PASSWORD, 
  },
});

router.use(express.json()); // Middleware to parse JSON request bodies

router.get('/', (req, res) => {
  res.send({ message: 'Welcome to email-service!' });
});

router.post('/send', async (req, res) => {
  console.log('Request body:', req.body);
  const { email, subject, content } = req.body;

  if (!email || !subject || !content) {
    return res.status(400).json({ error: 'Email, subject, and content are required' });
  }
  console.log('Sending email to:', email);

  try {
    // Send email using Nodemailer
    const info = await transporter.sendMail({
      from: `RuralSync <${process.env.GMAIL_USER}>`, // Sender email
      to: email,
      subject: subject,
      html: content, // HTML content (or use 'text' property for plain text)
    });

    console.log('Email sent:', info);
    return res.status(200).json({ message: 'Email sent successfully', data: info });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

export default router;

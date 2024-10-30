import express from 'express';
import { Resend } from 'resend';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

router.get('/', (req, res) => {
  res.send({ message: 'Welcome to email-service!' });
});

router.post('/send', async (req, res) => {
  const { email, subject, content } = req.body;

  if (!email || !subject || !content) {
    return res.status(400).json({ error: 'Email, subject, and content are required' });
  }
  console.log('Sending email to:', email);
  try {
    const response = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject,
      html: content,
    })

    return res.status(200).json({ message: 'Email sent successfully', data: response.data });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

export default router;
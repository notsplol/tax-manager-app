import express from 'express';
import { sendEmail } from '../utils/email';

const router = express.Router();

router.post('/send-email', async (req, res) => {
  const { to, subject, body } = req.body;

  try {
    const result = await sendEmail(to, subject, body);
    res.status(200).json({ success: true, result });
  } catch (err) {
    console.error('Email route error:', err);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

export default router;

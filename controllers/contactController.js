// controllers/contactController.js
const Contact = require('../models/Contact');
const emailService = require('../services/emailService');

exports.createContactMessage = async (req, res) => {
  try {
    const { name, email, phone, company, message, senderId } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(200).json({
        message: { error: "Name, email, and message are required fields." },
        status: 422
      });
    }

    // Save contact message to database
    const contact = new Contact({ name, email, phone, company, message, senderId });
    await contact.save();

    // Send confirmation email using reusable email service
    const emailResult = await emailService.sendContactConfirmationEmail(
      email,
      name,
      message
    );

    if (!emailResult.success) {
      console.error('[ContactController] Email sending failed:', emailResult.error);
      // Even if email fails, message is saved, so we inform the user
      return res.status(200).json({
        message: 'Message saved but email notification failed. We will still review your message.',
        status: 200
      });
    }

    res.status(200).json({
      message: 'Message sent successfully. Check your email for confirmation.',
      status: 201
    });

  } catch (error) {
    console.error('Error creating contact message:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

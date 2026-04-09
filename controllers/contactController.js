// controllers/contactController.js
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');
// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.createContactMessage = async (req, res) => {
  try {
    const { name, email, phone, company, message, senderId } = req.body;

    // Save contact message to database
    const contact = new Contact({ name, email, phone, company, message, senderId });
    await contact.save();

    // Send email notification
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'New Contact Message',
      text: `
        New message from: ${name}
        Email: ${email}
        Phone: ${phone || 'N/A'}
        Company: ${company || 'N/A'}
        
        Message:
        ${message}
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Failed to send email' });
      }
      console.log('Email sent:', info.response);
      res.status(200).json({ message: 'Message sent successfully' });
    });

  } catch (error) {
    console.error('Error creating contact message:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

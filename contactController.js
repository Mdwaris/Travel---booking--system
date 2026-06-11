const mongoose = require('mongoose');
const ContactSubmission = require('../models/ContactSubmission');
const { contactSubmissions } = require('../data/store');
const { validateEmail } = require('../utils/validation');

async function createContactSubmission(req, res) {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All contact fields are required.' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  let submission;

  if (mongoose.connection.readyState === 1) {
    submission = await ContactSubmission.create({ name, email, subject, message });
  } else {
    submission = {
      id: contactSubmissions.length + 1,
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
    };
    contactSubmissions.push(submission);
  }

  return res.status(201).json({
    message: `Thank you, ${name}! Your message has been received.`,
    submission,
  });
}

async function listContactSubmissions(req, res) {
  if (mongoose.connection.readyState === 1) {
    const submissions = await ContactSubmission.find().sort({ createdAt: -1 }).lean();
    return res.json(submissions);
  }

  return res.json([...contactSubmissions].reverse());
}

module.exports = {
  createContactSubmission,
  listContactSubmissions,
};

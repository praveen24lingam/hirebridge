const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    });

    return info;
  } catch (error) {
    console.error('Email sending failed', {
      recipient: to,
      subject,
      error: error.message,
      timestamp: new Date().toISOString()
    });

    return null;
  }
};

module.exports = sendEmail;

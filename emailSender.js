// emailSender.js

const nodemailer = require('nodemailer');

async function sendEmail(mailObj) {
  return new Promise((resolve, reject) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'treatmentbuilderapp@gmail.com',
      pass: 'madv zedu cfqh eiyn'
    }
  });

  const mailOptions = {
    from: 'treatmentbuilderapp@gmail.com',
    to: mailObj.toEmail,
    subject: 'Health App - Disease Information',
    html: `
      <p>Dear ${mailObj.firstName},</p>
      <p>Thank you for filling out About Face Skin Care’s virtual consultation form!</p>
      <p>Your customized results have been saved and you can return to our site to view your results at any time. Please click below to view your results on our website.</p>
      <p>${mailObj.email_string}</p>
      <p>- About Face Skin Care</p>
    `
  };

  try {
    const info =  transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
  )}

module.exports = {
  sendEmail
};

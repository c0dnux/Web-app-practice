// const nodemailer = require("nodemailer");
// const { MailtrapTransport } = require("mailtrap");

// const sendEmail = async (options) => {
//   const TOKEN = "********b7ec";

//   const transporter = nodemailer.createTransport(
//     MailtrapTransport({
//       token: TOKEN,
//       testInboxId: 3366356,
//     })
//   );
//   const sender = {
//     address: "hello@example.com",
//     name: "Mailtrap Test",
//   };
//   const recipients = ["saniabdulrahman851@gmail.com"];
//   const mailOptions = {
//     from: sender,
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     category: "Integration Test",
//     sandbox: true,
//     // html:op
//   };
//   await transporter.sendMail(mailOptions);
// };
// Looking to send emails in production? Check out our Email API/SMTP product!
const nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");
const { options } = require("../app");
const sendEmail = async (options) => {
  const TOKEN = "a8fcb9359b4933e75ec270de77b1b7ec";

  const transporter = nodemailer.createTransport(
    MailtrapTransport({
      token: TOKEN,
      testInboxId: 3366356,
    })
  );

  const sender = {
    address: "hello@example.com",
    name: "Mailtrap Test",
  };
  const recipients = [options.email];
  const mailOptions = {
    from: sender,
    to: recipients,
    subject: options.subject,
    text: options.message,
    category: "Integration Test",
    sandbox: true,
  };
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;

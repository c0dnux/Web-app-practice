const nodemailer = require("nodemailer");
const pug = require("pug");
const { htmlToText } = require("html-to-text");
require("dotenv").config();
const SibApiV3Sdk = require("sib-api-v3-sdk");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = { name: "Sani Abdulrahman", email: process.env.EMAIL_FROM };
  }

  async newTransport() {
    if (process.env.NODE_ENV === "production") {
      const defaultClient = SibApiV3Sdk.ApiClient.instance;
      const apiKey = defaultClient.authentications["api-key"];
      apiKey.apiKey = process.env.BREVO_API_KEY;

      return new SibApiV3Sdk.TransactionalEmailsApi();
    }

    // Development: Use Mailtrap (or other service)

    return nodemailer.createTransport(
      MailtrapTransport({
        token: process.env.MAILTRAP_TOKEN,
        testInboxId: 3366356,
      })
    );
  }

  async send(template, subject) {
    // 1️⃣ Render HTML using Pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2️⃣ Convert HTML to plain text
    const text = htmlToText(html);

    const transport = await this.newTransport();

    if (process.env.NODE_ENV === "production") {
      // Send via Brevo API
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail({
        sender: this.from,
        to: [{ email: this.to }],
        subject,
        htmlContent: html,
        textContent: text,
      });

      try {
        const response = await transport.sendTransacEmail(sendSmtpEmail);
        console.log("Email sent successfully:", response);
      } catch (error) {
        console.error("Error sending email:", error);
      }
    } else {
      // Send via Nodemailer (Mailtrap in development)
      await transport.sendMail({
        from: this.from,
        to: this.to,
        subject,
        html,
        text,
        category: "Integration Test",
        sandbox: true,
      });
    }
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the Natours Family!");
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
};

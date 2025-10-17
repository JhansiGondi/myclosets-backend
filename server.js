// server.js
import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Allow requests from your frontend domain
app.use(cors({ origin: "https://myclosets.in" })); 
app.use(express.json());

// Contact form POST endpoint
app.post("/send-mail", async (req, res) => {
  const { name, phone, email, projectType, message } = req.body;

  if (!name || !email || !phone || !projectType) {
    return res.status(400).json({ success: false, message: "All required fields must be filled." });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const adminMail = {
    from: `"${name}" <${email}>`,
    replyTo: email,
    to: process.env.ADMIN_EMAIL,
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <h3>New Inquiry Received</h3>
      <p><b>Name:</b> ${name}</p>
      <p><b>Phone:</b> ${phone}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Project Type:</b> ${projectType}</p>
      <p><b>Message:</b> ${message}</p>
    `,
  };

  const userMail = {
    from: `"MyClosets Interiors" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Thank you for contacting MyClosets Interiors!",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="color: #b49770;">Thank you, ${name}!</h2>
        <p>We've received your message and our design expert will contact you shortly.</p>
        <hr/>
        <p style="color: gray;">
          Warm regards,<br/>
          <b>MyClosets Interiors</b><br/>
          Hyderabad | +91 9988745678
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(adminMail);
    await transporter.sendMail(userMail);
    res.status(200).json({ success: true, message: "Emails sent successfully!" });
  } catch (err) {
    console.error("Error sending emails:", err);
    res.status(500).json({ success: false, message: "Failed to send emails." });
  }
});

// Use dynamic port for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

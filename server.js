import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Loads environment variables from the .env file

const app = express();
app.use(cors({ origin: "https://myclosets.in" }));  // Replace with your GoDaddy domain
app.use(express.json()); // to parse incoming JSON requests

// POST endpoint to handle the contact form submission
app.post("/send-mail", async (req, res) => {
  const { name, phone, email, projectType, message } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !projectType) {
    return res.status(400).json({ success: false, message: "All required fields must be filled." });
  }

  // Set up Nodemailer transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  // Admin email (email to your email address)
  const adminMail = {
    from: `"${name}" <${email}>`,  // Shows user's name and email
    replyTo: email,
    to: process.env.ADMIN_EMAIL,  // This is your admin email
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

  // Auto-response email to user (Thank you email)
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
    // Send both the admin and user emails
    await transporter.sendMail(adminMail);
    await transporter.sendMail(userMail);

    res.status(200).json({ success: true, message: "Emails sent successfully!" });
  } catch (err) {
    console.error("Error sending emails:", err);
    res.status(500).json({ success: false, message: "Failed to send emails." });
  }
});

// Use the PORT from environment variables or fallback to 5000 if not specified
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

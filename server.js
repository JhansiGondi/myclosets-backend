const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

app.use(cors({ origin: ["https://myclosets.in", "https://www.myclosets.in"] }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Contact route
app.post("/api/send-mail", async (req, res) => {
  const { name, phone, email, projectType, message } = req.body || {};

  if (!name || !email || !phone || !projectType) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
      connectionTimeout: 20_000,
      greetingTimeout: 20_000,
      socketTimeout: 30_000,
    });

    // To Admin
    await transporter.sendMail({
      from: `"${name}" <${process.env.GMAIL_USER}>`,
      replyTo: email,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h3>New Inquiry Received</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Project Type:</b> ${projectType}</p>
        <p><b>Message:</b><br>${message || ""}</p>
      `,
    });

    // Auto-reply to user
    await transporter.sendMail({
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
    });

    res.json({ success: true, message: "Emails sent successfully." });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ success: false, message: "Email send failed." });
  }
});


// IMPORTANT for Passenger (cPanel) – listen on provided PORT
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

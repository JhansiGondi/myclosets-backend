import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/send-mail", async (req, res) => {
  const { name, phone, email, projectType, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "jhanjohn9999@gmail.com", // your Gmail
      pass: "toctfgxqtlhgzqof", // generated app password
    },
  });

  // Admin email to receive the form submission
  const adminMail = {
    from: `"${name}" <${email}>`, // user’s real email
    replyTo: email, // replies go to user’s real email
    to: "jhanjohn9999@gmail.com",
    subject: `New Contact Message from ${name}`,
    html: `
      <h3>New Inquiry Received</h3>
      <p><b>Name:</b> ${name}</p>
      <p><b>Phone:</b> ${phone}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Project Type:</b> ${projectType}</p>
      <p><b>Message:</b><br>${message}</p>
    `,
  };

  // User email for auto-response
  const userMail = {
    from: `"MyClosets Interiors" <jhanjohn9999@gmail.com>`,
    to: email,
    subject: "Thank You for Contacting MyClosets Interiors!",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;">
        <h2 style="color:#b49770;">Thank you, ${name}!</h2>
        <p>We’ve received your message and our design expert will reach out to you shortly.</p>
        <hr/>
        <p style="color:gray;">
          Warm regards,<br/>
          <b>MyClosets Interiors</b><br/>
          Hyderabad | +91 63024 30938
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(adminMail);
    await transporter.sendMail(userMail);
    res.status(200).json({ success: true, message: "✅ Emails sent successfully" });
  } catch (err) {
    console.error("❌ Error sending email:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, textContent, htmlContent }) => {
  try {
    const mailOptions = {
      from: `"Hair Language" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: textContent,
      html: htmlContent,
      priority: "high",
    };

    const info = await transporter.sendMail(mailOptions);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error: error.message };
  }
};

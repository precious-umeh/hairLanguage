import ContactMessage from "../models/contactMessage.js";
import {
  adminContactAlert,
  contactMsgTemplate,
} from "../utils/emailTemplates.js";
import { sendEmail } from "../utils/sendEmail.js";

export async function createMessage(req, res) {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    const newMessage = new ContactMessage({ name, email, subject, message });
    const savedMessage = await newMessage.save();

    try {
      // Auto reply user
      await sendEmail({
        to: email,
        subject: "We received your message - Hair Language",
        textContent: `Hi ${name}, Thanks for reaching out! We've recieved your inquiry regarding ${subject || "General Inquiry"}. Our team typically responds within 24 hours. Here is a copy of your message: "${message}" --- Best regards, The Hair Language Team`,
        htmlContent: contactMsgTemplate(name, subject, message),
      });

      //  Instant alert to admin
      await sendEmail({
        to: process.env.EMAIL_USER,
        subject: `📩 New Contact Form: ${subject || "No Subject"}`,
        textContent: `New Website Message\n\nFrom: ${name} (${email})\nSubject: ${subject || "N/A"}\nMessage: ${message}\n\n---\nReply directly to this email or view it in your Admin Panel.`,
        htmlContent: adminContactAlert(name, email, subject, message),
      });
    } catch (emailError) {
      console.error(`Email failed to send but data was saved: `, emailError);
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully and emails delivered!",
      data: savedMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error, try again later.",
      error: error.message,
    });
  }
}

export async function getMessages(req, res) {
  try {
    const messages = await ContactMessage.find().sort({
      createdAt: -1,
    });
    res.status(200).json({
      message: "Messages retrieved successfully",
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching messages.",
    });
  }
}

export async function replyToMessage(req, res) {
  try {
    const { id } = req.params;
    const { response } = req.body;

    const msg = await ContactMessage.findById(id);
    if (!msg) {
      return res.status(404).json({
        status: false,
        message: "Message not found.",
      });
    }

    msg.adminReply = response;
    if (msg.status === "pending") {
      msg.status = "contacted";
    }
    msg.repliedAt = Date.now();
    await msg.save();

    await sendEmail({
      to: msg.email,
      subject: "Update regarding your inquiry",
      htmlContent: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e6e6e6; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #2e2e2e; padding: 20px; text-align: center;">
              <h1 style="color: #fff; margin: 0; letter-spacing: 2px; font-size: 24px;">HAIR LANGUAGE</h1>
            </div>
  
            <div style="padding: 40px 30px; line-height: 1.6; color: #333;">
              <h2 style="font-size: 18px; margin-bottom: 20px;">Hello ${msg.name},</h2>
              <p style="margin-bottom: 25px;">${response}</p>
        
              <div style="margin-top: 40px; border-top: 1px solid #e6e6e6; padding-top: 20px;">
                <p style="font-size: 14px; color: #7a7a7a; margin: 0;">Best regards,</p>
                <p style="font-weight: bold; margin: 5px 0 0 0;">Franscisca</p>
                <p style="font-size: 12px; color: #6b6b6b;">Founder, Hair Language</p>
              </div>
            </div>
          </div>
        `,
    });

    res.status(200).json({
      success: true,
      message: "Reply sent and status updated successfully",
      data: msg,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Reply failed to send",
      error: error.message,
    });
  }
}

export async function updateMessageStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedStatus = await ContactMessage.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    );

    if (!updatedStatus) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json({
      message: "Status updated successfully",
      data: updatedStatus,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to update status",
      error: error.message,
    });
  }
}

export async function deleteMessage(req, res) {
  try {
    const deleted = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json({
      message: "Message deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Unable to delete message", error: error.message });
  }
}

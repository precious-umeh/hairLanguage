import Consultation from "../models/consultation.js";
import {
  adminConsultationAlert,
  consultationTemplate,
} from "../utils/emailTemplates.js";
import { sendEmail } from "../utils/sendEmail.js";

export async function sendBookings(req, res) {
  try {
    const { name, contact, message } = req.body;
    const bookingData = { ...req.body };

    if (req.user && req.user.id) {
      bookingData.user = req.user.id;
    }

    const newConsultation = new Consultation(bookingData);
    const savedBooking = await newConsultation.save();

    const isEmail = contact && contact.includes("@");

    // Auto reply to the user
    if (isEmail) {
      await sendEmail({
        to: contact,
        subject: "Consultation Recieved - Hair Language",
        textContent: `Hello ${name}, Thank you for reaching out to Hair Language! We've recieved your consultation request and our team will get back to you shortly. Best regards, Francisca`,
        htmlContent: consultationTemplate(name),
      });
    }

    // Instant alert to admin
    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: `🚨 NEW BOOKING: ${name}`,
      textContent: `New Consultation Request\n\nName: ${name}\nContact: ${contact}\nMessage: ${message || "No message provided"}\nStatus: Pending\n\n---\nManage this request in your Admin Dashboard: ${process.env.ADMIN_URL || "Check your panel"}`,
      htmlContent: adminConsultationAlert(name, contact, message),
    });

    res.status(201).json({
      success: true,
      message: "Consultation booked and emails sent!",
      booking: savedBooking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error booking consultation",
      error: error.message,
    });
  }
}

export async function receiveBookings(req, res) {
  try {
    const consultations = await Consultation.find().sort({
      createdAt: -1,
    });
    res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      bookings: consultations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message,
    });
  }
}

export async function replyToBooking(req, res) {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const booking = await Consultation.findById(id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    booking.adminReply = message;
    if (booking.status === "pending") {
      booking.status = "contacted";
    }
    booking.repliedAt = Date.now();
    await booking.save();

    await sendEmail({
      to: booking.contact,
      subject: "Update regarding your Hair Language Consultation",
      htmlContent: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e6e6e6; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #2e2e2e; padding: 20px; text-align: center;">
            <h1 style="color: #fff; margin: 0; letter-spacing: 2px; font-size: 24px;">HAIR LANGUAGE</h1>
          </div>

          <div style="padding: 40px 30px; line-height: 1.6; color: #333;">
            <h2 style="font-size: 18px; margin-bottom: 20px;">Hello ${booking.name},</h2>
            <p style="margin-bottom: 25px;">${message}</p>
      
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
      data: booking,
    });
  } catch (error) {
    console.error("Backend error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during the reply process",
      error: error.message,
    });
  }
}

export async function updateBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await Consultation.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      booking: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteBookings(req, res) {
  try {
    const deleted = await Consultation.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete booking",
      error: error.message,
    });
  }
}

export async function getMyBookings(req, res) {
  try {
    const userId = req.user.id;

    const myBookings = await Consultation.find({
      user: userId,
      deletedByUser: { $ne: true }, // This finds everything NOT explicitly set to true
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: myBookings.length,
      bookings: myBookings,
      message: "Bookings retrieved successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve your bookings.",
      error: error.message,
    });
  }
}

export async function softDeleteBooking(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Consultation.findOneAndUpdate(
      { _id: id, user: userId },
      { deletedByUser: true },
      { returnDocument: "after" },
    );

    if (!booking) {
      return res
        .status(404)
        .json({ message: "Booking not found or unauthorized" });
    }

    res.status(200).json({
      success: true,
      message: "Activity successfully removed from your profile.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to remove activity from your profile.",
      error: error.message,
    });
  }
}

/*
export async function sendBookings(req, res) {
  try {
    const { name, contact, message } = req.body;

    const newConsultation = new Consultation(req.body);
    const savedBooking = await newConsultation.save();

    const isEmail = contact && contact.includes("@");

    // Auto reply to the user
    if (isEmail) {
      await sendEmail({
        to: contact,
        subject: "Consultation Recieved - Hair Language",
        textContent: `Hello ${name}, Thank you for reaching out to Hair Language! We've recieved your consultation request and our team will get back to you shortly. Best regards, Francisca`,
        htmlContent: consultationTemplate(name),
      });
    }

    // Instant alert to admin
    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: `🚨 NEW BOOKING: ${name}`,
      textContent: `New Consultation Request\n\nName: ${name}\nContact: ${contact}\nMessage: ${message || "No message provided"}\nStatus: Pending\n\n---\nManage this request in your Admin Dashboard: ${process.env.ADMIN_URL || "Check your panel"}`,
      htmlContent: adminConsultationAlert(name, contact, message),
    });

    res.status(201).json({
      success: true,
      message: "Consultation booked and emails sent!",
      booking: savedBooking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error booking consultation",
      error: error.message,
    });
  }
}
*/

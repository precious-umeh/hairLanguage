import Newsletter from "../models/newsletter.js";
import { sendEmail } from "../utils/sendEmail.js";
import { newsletterTemplate } from "../utils/emailTemplates.js";

export async function subscribe(req, res) {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required." });
    }

    const existing = await Newsletter.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: "You are already subscribed!" });
    }

    const subscriber = new Newsletter({ email: normalizedEmail });
    const savedSubscriber = await subscriber.save();

    try {
      await sendEmail({
        to: email,
        subject: "Welcome to the Hair Language Newsletter",
        textContent: `Welcome aboard! Thank you for subscribing to Hair Language. You'll now be the first to know about our new arrivals, wig care tips, and exclusive offers. Stay beautiful, Franscisca - Founder, Hair Language`,
        htmlContent: newsletterTemplate(),
      });
    } catch (emailError) {
      console.error("Welcome email failed to send: ", emailError.message);
    }

    res.status(201).json({
      success: true,
      message: "User subscribed successfully!",
      data: savedSubscriber,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error, please try again later.",
      error: error.message,
    });
  }
}

export async function getSubscribers(req, res) {
  try {
    const subscribers = await Newsletter.find().sort({
      subscribedAt: -1,
    });

    res.status(200).json({
      success: true,
      count: subscribers.length,
      message: "Subscribers retrieved successfully.",
      data: subscribers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching subscribers",
      error: error.message,
    });
  }
}

export async function removeSubscriber(req, res) {
  try {
    const { id } = req.params;

    const deletedSubscriber = await Newsletter.findByIdAndDelete(id);

    if (!deletedSubscriber) {
      return res.status(404).json({ message: "Subscriber not found" });
    }

    res.status(200).json({
      success: true,
      message: "Subscriber deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to remove subscriber",
      error: error.message,
    });
  }
}

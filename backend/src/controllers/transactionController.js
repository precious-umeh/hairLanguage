import Transaction from "../models/transaction.js";
import axios from "axios";
import Order from "../models/order.js";
import { sendEmail } from "../utils/sendEmail.js";
import { paymentSuccessTemplate } from "../utils/emailTemplates.js";

const PAYSTACK_URL = "https://api.paystack.co/transaction";

// INITIALIZE TRANSACTION
export async function initializePayment(req, res) {
  try {
    const { orderId } = req.body;

    // Fetch the order to geth the exact amount and email
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    console.log(
      "Redirecting to:",
      `${process.env.FRONTEND_URL}/pages/payment/verify`,
    );

    const params = {
      email: order.email,
      amount: order.totalAmount * 100,
      reference: `HL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      callback_url: `${process.env.FRONTEND_URL}/pages/payment/verify`, // Where Paystack redirects after payment
      metadata: {
        orderId: order._id,
        userId: order.userId || null,
      },
    };

    const response = await axios.post(`${PAYSTACK_URL}/initialize`, params, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    // Create a pending transaction record
    await Transaction.create({
      orderId: order._id,
      userId: order.userId || null,
      email: order.email,
      amount: order.totalAmount,
      reference: params.reference,
      status: "pending",
    });

    // Send the Paystack authorization url to the Frontend
    res.status(200).json({
      success: true,
      message: "Payment initialized successfully",
      data: response.data.data, // This contains the authorization url
    });
  } catch (error) {
    res.status(500).json({
      message: "Payment initialization failed.",
      error: error.response?.data?.message || error.message,
    });
  }
}

// VERIFY TRANSACTION
export async function verifyPayment(req, res) {
  try {
    const { reference } = req.params;

    const response = await axios.get(`${PAYSTACK_URL}/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = response.data.data;

    if (data.status === "success") {
      // Update Transaction
      const transaction = await Transaction.findOneAndUpdate(
        { reference },
        {
          status: "success",
          paystackId: data.id,
          paidAt: data.paid_at,
          channel: data.channel,
        },
        { returnDocument: "after" },
      );

      // Update Order Status to "paid"
      const updatedOrder = await Order.findByIdAndUpdate(
        transaction.orderId,
        {
          status: "paid",
          paymentReference: reference,
        },
        { returnDocument: "after" },
      );

      try {
        await sendEmail({
          to: transaction.email,
          subject: "Payment Received! - Hair Language",
          textContent: `Payment confirmed for order #${transaction.orderId}`,
          htmlContent: paymentSuccessTemplate(
            transaction.orderId,
            updatedOrder.totalAmount,
          ),
        });
      } catch (emailError) {
        console.error("Payment Confirmation Email Failed:", emailError);
      }

      return res.status(200).json({
        success: true,
        message: "Payment Successful.",
        data,
      });
    }

    res.status(400).json({ message: "Payment was not successful." });
  } catch (error) {
    res.status(500).json({
      message: "Payment verification failed.",
      error: error.message,
    });
  }
}

// GET ALL TRANSACTIONS (for admin)
export async function getAllTransactions(req, res) {
  try {
    const transactions = await Transaction.find()
      .populate("orderId", "totalAmount status items")
      .populate("userId", "productName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All transactions retrieved successfully.",
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve transactions.",
      error: error.message,
    });
  }
}

// GET USER TRANSACTIONS
export async function getUserTransactions(req, res) {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({ userId })
      .populate("orderId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "User transactions retrieved successfully.",
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch your transactions.",
      error: error.message,
    });
  }
}

// import crypto from "crypto";

// export async function paystackWebhook(req, res) {
//   try {
//     // 1. Verify the event is from Paystack
//     const hash = crypto
//       .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
//       .update(JSON.stringify(req.body))
//       .digest("hex");

//     if (hash !== req.headers["x-paystack-signature"]) {
//       return res.status(400).send("Invalid signature");
//     }

//     // 2. Get the event data
//     const event = req.body;

//     // 3. Handle 'charge.success'
//     if (event.event === "charge.success") {
//       const { reference, metadata, id, paid_at, channel } = event.data;

//       // Update Transaction
//       const transaction = await Transaction.findOneAndUpdate(
//         { reference },
//         {
//           status: "success",
//           paystackId: id,
//           paidAt: paid_at,
//           channel: channel,
//           metadata: event.data
//         }
//       );

//       if (transaction) {
//         // Update Order to 'paid'
//         await Order.findByIdAndUpdate(transaction.orderId, {
//           status: "paid",
//           paymentReference: reference
//         });

//         // Optional: Trigger an Email notification to the admin/user here
//       }
//     }

//     // Always respond with 200 to tell Paystack you received it
//     res.status(200).send("Webhook Received");
//   } catch (error) {
//     console.error("Webhook Error:", error.message);
//     res.status(500).send("Internal Server Error");
//   }
// }
// routes/paymentRoutes.js
// router.post("/webhook", paystackWebhook);

// Get all transactions (for admin)
// export async function getAllTransactions(req, res) {
//   try {
//     const transactions = await Transaction.find().sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       message: "Transactions retrieved successfully",
//       transactions,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Unable to retrieve transactions",
//       error: error.message,
//     });
//   }
// }

// Get transactions for a specific user
// export async function getUserTransaction(req, res) {
//   try {
//     const { userId, email } = req.params;

//     // We search across nested metadata (product field in transaction holds metadata)
//     const transactions = await Transaction.find({
//       $or: [
//         { "productId.userId": userId },
//         { userId: userId },
//         { email: email },
//       ],
//     }).sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       message: "User transactions retrieved successfully",
//       transactions,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Unable to retrieve user transactions",
//       error: error.message,
//     });
//   }
// }

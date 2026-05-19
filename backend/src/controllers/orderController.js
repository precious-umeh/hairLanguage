import Order from "../models/order.js";
import Product from "../models/product.js";
import mongoose from "mongoose";
import { sendEmail } from "../utils/sendEmail.js";
import { orderReceivedTemplate } from "../utils/emailTemplates.js";

// CREATE ORDER
export async function createOrder(req, res) {
  try {
    const { items, shippingAddress, email } = req.body;

    const userId = req.user ? req.user.id : null;
    const userEmail = req.user ? req.user.email : email;

    if (!userEmail) {
      return res
        .status(400)
        .json({ message: "Email is required for checkout." });
    }

    let totalAmount = 0;
    const orderItems = [];

    // The loop starts here - 'item' is defined ONLY inside these curly braces
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        // FIX: If product is not found, we use item.productName which is passed from frontend
        return res.status(404).json({
          message: `Product ${item.productName || "Unknown"} not found.`,
        });
      }

      let itemPrice = product.price;
      if (item.size) {
        const variation = product.lengths.find(
          (l) => Number(l.size) === Number(item.size),
        );
        if (variation) itemPrice = variation.price;
      }

      totalAmount += itemPrice * item.quantity;

      orderItems.push({
        productId: item.productId,
        productName: item.productName,
        size: item.size,
        colorName: item.colorName,
        // Check if item exists before accessing colorId
        colorId: mongoose.Types.ObjectId.isValid(item.colorId)
          ? item.colorId
          : null,
        quantity: item.quantity,
        price: itemPrice,
      });
    }
    // The loop ends here. If you use 'item' below this line, it will crash.

    const newOrder = await Order.create({
      userId,
      email: userEmail,
      items: orderItems,
      totalAmount,
      shippingAddress,
      status: "pending",
    });

    // Run stock subtraction
    await subtractStock(orderItems);

    // Send Email
    try {
      await sendEmail({
        to: userEmail,
        subject: "Order Confirmation - Hair Language",
        textContent: `Your order #${newOrder._id} has been received`,
        htmlContent: orderReceivedTemplate(newOrder),
      });
    } catch (emailError) {
      console.error("Email Failed:", emailError);
    }

    res.status(201).json({
      success: true,
      orderId: newOrder._id,
      totalAmount: newOrder.totalAmount,
      message: "Order created successfully.",
    });
  } catch (error) {
    // This is where your "item is not defined" message is being caught
    res.status(500).json({
      success: false,
      message: "Unable to create order.",
      error: error.message,
    });
  }
}

// export async function createOrder(req, res) {
//   try {
//     const { items, shippingAddress, email } = req.body;

//     // Identify User (User or Guest)
//     const userId = req.user ? req.user.id : null;
//     const userEmail = req.user ? req.user.email : email;

//     if (!userEmail) {
//       return res
//         .status(400)
//         .json({ message: "Email is required for checkout." });
//     }

//     // Calculate total and validate items
//     let totalAmount = 0;
//     const orderItems = [];

//     for (const item of items) {
//       const product = await Product.findById(item.productId);
//       if (!product) {
//         return res
//           .status(404)
//           .json({
//             message: `Product ${item.productName || "Unknown"} not found.`,
//           });
//       }

//       // Determine price based on length
//       let itemPrice = product.price;
//       if (item.size) {
//         const variation = product.lengths.find(
//           (l) => Number(l.size) === Number(item.size),
//         );
//         if (variation) {
//           itemPrice = variation.price;
//         }
//       }

//       totalAmount += itemPrice * item.quantity;

//       orderItems.push({
//         productId: item.productId,
//         productName: item.productName,
//         size: item.size,
//         colorName: item.colorName,
//         colorId: mongoose.Types.ObjectId.isValid(item.colorId)
//           ? item.colorId
//           : null,
//         quantity: item.quantity,
//         price: itemPrice,
//       });
//     }

//     // Create the order in pending status
//     const newOrder = await Order.create({
//       userId,
//       email: userEmail,
//       items: orderItems,
//       totalAmount,
//       shippingAddress,
//       status: "pending",
//     });

//     // Subtract stock
//     await subtractStock(orderItems);

//     res.status(201).json({
//       success: true,
//       orderId: newOrder._id,
//       totalAmount: newOrder.totalAmount,
//       message: "Order created successfully.",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Unable to create order.",
//       error: error.message,
//     });
//   }
// }

// GET ALL ORDERS (Admin only)
export async function getAllOrders(req, res) {
  try {
    const orders = await Order.find({ deletedByAdmin: { $ne: true } })
      .sort({ createdAt: -1 })
      .populate("userId", "name email");

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully.",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to retrieve orders.",
      error: error.message,
    });
  }
}

// GET USER ORDER HISTORY (Logged In users only)
export async function getUserOrders(req, res) {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Filter for soft delete
    const orders = await Order.find({
      $or: [{ userId: userId }, { email: userEmail }],
      deletedByUser: { $ne: true },
      deletedByAdmin: { $ne: true },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully.",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch your orders.",
      error: error.message,
    });
  }
}

// GUEST ORDER LOOKUP
export async function guestOrderLookup(req, res) {
  try {
    const { orderId, email } = req.body;

    if (!orderId || !email) {
      return res
        .status(400)
        .json({ message: "Please provide both Order ID and Email." });
    }

    // Find the order that matches both ID and Email
    const order = await Order.findOne({
      _id: orderId,
      email: email,
      deletedByAdmin: { $ne: true },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found. Please check your details and try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order retrieved successfully.",
      data: order,
    });
  } catch (error) {
    // Handle cases where ID is not valid MongodDB Id
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid Order ID format" });
    }

    res.status(500).json({
      message: "Unable to retrieve order.",
      error: error.message,
    });
  }
}

// GET SINGLE ORDER DETAILS (For both Admin and User)
export async function getOrderById(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check user role
    const isAdmin = req.user.role === "admin";
    const isOwner = order.userId?.toString() === req.user.id.toString();
    const isGuestOwner = !order.userId && order.email === req.user?.email;

    if (isAdmin || isOwner || isGuestOwner) {
      return res.status(200).json({
        success: true,
        message: "Order retrieved successfully.",
        data: order,
      });
    }

    res.status(403).json({ message: "Not authorized to view this order." });
  } catch (error) {
    res.status(500).json({
      message: "Unable to retrieve order.",
      error: error.message,
    });
  }
}

// STOCK REVERSION HELPER FUNCTION
async function revertStock(items) {
  const promises = items.map(async (item) => {
    const product = await Product.findById(item.productId);
    if (!product) return;

    if (item.size) {
      // Revert stock for a specific length
      await Product.updateOne(
        { _id: item.productId, "lengths.size": item.size },
        { $inc: { "lengths.$.inventory": item.quantity } },
      );
    } else {
      // Revert global stock if no size was specified
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { inventory: item.quantity } },
      );
    }
  });

  await Promise.all(promises);
}

// STOCK SUBTRACTION HELPER FUNCTION
async function subtractStock(items) {
  const promises = items.map(async (item) => {
    const product = await Product.findById(item.productId);
    if (!product) return;

    if (item.size) {
      // Subtract stock for a specific length/size
      await Product.updateOne(
        { _id: item.productId, "lengths.size": item.size },
        { $inc: { "lengths.$.inventory": -Math.abs(item.quantity) } },
      );
    } else {
      // Subtract global stock
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { inventory: -Math.abs(item.quantity) } },
      );
    }
  });

  await Promise.all(promises);
}

// UPDATE ORDER STATUS
export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Prevent reverting stock multiple times if the order is already cancelled
    if (status === "cancelled" && order.status !== "cancelled") {
      await revertStock(order.items);
    }

    // Logic for the reverse: If a cancelled order is moved back to 'pending' or 'paid'
    // You would technically need to subtract stock again, but usually,
    // cancelled orders stay cancelled.

    order.status = status;
    await order.save();

    // const order = await Order.findByIdAndUpdate(
    //   id,
    //   { status },
    //   { returnDocument: "after" },
    // );

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status} successfully.`,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to update order status.",
      error: error.message,
    });
  }
}

// USER SOFT DELETE ORDER
export async function softDeleteOrder(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOneAndUpdate(
      { _id: id, userId: userId },
      { deletedByUser: true },
      { returnDocument: "after" },
    );

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found or unauthorized" });
    }

    res.status(200).json({
      success: true,
      message: "Order successfully removed from your profile.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to remove order from your profile.",
      error: error.message,
    });
  }
}

// DELETE ORDER
export async function removeOrder(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Block removal of paid items
    if (order.status === "paid") {
      return res
        .status(400)
        .json({ message: "Cannot remove a paid order. Cancel it first." });
    }

    if (order.status === "pending") {
      await revertStock(order.items);
    }

    order.deletedByAdmin = true;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order removed sucessfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to remove order.",
      error: error.message,
    });
  }
}

// DELETE ORDER
// export async function deleteOrder(req, res) {
//   try {
//     const order = await Order.findByIdAndDelete(req.params.id);
//     if (!order) {
//       return res.status(404).json({ message: "Order not found." });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Order deleted sucessfully.",
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Unable to delete order.",
//       error: error.message,
//     });
//   }
// }

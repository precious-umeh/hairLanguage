import Cart from "../models/cart.js";
import Product from "../models/product.js";
import mongoose from "mongoose";

const resolveLengthStock = (product, selectedLength) => {
  const hasLengths = Array.isArray(product.lengths) && product.lengths.length > 0;

  if (!hasLengths) {
    return {
      availableStock: Number(product.inventory) || 0,
      lengthData: null,
    };
  }

  if (selectedLength === null || selectedLength === undefined) {
    return {
      availableStock: null,
      lengthData: null,
      error: "Please select a valid product length.",
    };
  }

  const lengthData = product.lengths.find(
    (item) => Number(item.size) === Number(selectedLength),
  );

  if (!lengthData) {
    return {
      availableStock: null,
      lengthData: null,
      error: "Selected length is not available for this product.",
    };
  }

  return {
    availableStock: Number(lengthData.inventory) || 0,
    lengthData,
  };
};

// Add to cart
export async function addToCart(req, res) {
  try {
    const { productId, quantity, sessionId, selectedLength, selectedColor } =
      req.body;

    const userId = req.user?.id;

    if (!userId && !sessionId) {
      return res
        .status(400)
        .json({ message: "User ID or Session ID is required." });
    }

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }

    // selectedColor must be ObjectId string if present
    if (selectedColor && !mongoose.Types.ObjectId.isValid(selectedColor)) {
      return res.status(400).json({ message: "Invalid selected color." });
    }

    // Coerce length (treat 0 as valid; empty string / null / undefined → null)
    let numericLength = null;
    if (
      selectedLength !== undefined &&
      selectedLength !== null &&
      selectedLength !== ""
    ) {
      const n = Number(selectedLength);
      numericLength = Number.isNaN(n) ? null : n;
    }

    // Fetch the product to get the latest pricing
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const requestedQuantity = Number(quantity) || 1;
    if (requestedQuantity <= 0) {
      return res.status(400).json({ message: "Quantity must be at least 1." });
    }

    // Determine the correct price and stock for the selected length
    let finalPrice = product.price; // Start with base price as fallback
    const {
      availableStock,
      lengthData,
      error: lengthError,
    } = resolveLengthStock(product, numericLength);

    if (lengthError) {
      return res.status(400).json({ message: lengthError });
    }

    if (availableStock <= 0) {
      return res
        .status(400)
        .json({ message: "This product variation is out of stock." });
    }

    if (lengthData) {
      finalPrice = lengthData.price;
    }

    // This finds the cart whether it belongs to a logged-in user or a guest session
    const query = userId ? { userId } : { sessionId };
    let cart = await Cart.findOne(query);

    // if (!cart) {
    //   cart = new Cart({
    //     userId: userId || undefined,
    //     sessionId: sessionId || undefined,
    //     items: [],
    //     totalPrice: 0,
    //     totalItems: 0,
    //   });
    // }
    if (!cart) {
      cart = new Cart({
        ...(userId && { userId }),
        ...(sessionId && { sessionId }),
        items: [],
      });
    }

    // Handle Color ID safely
    const colorIdString = selectedColor ? selectedColor.toString() : null;

    //  Find if this exact variation already exists in cart
    const existingItem = cart.items.find((item) => {
      const isSameProduct = item.productId.toString() === productId.toString();
      const isSameLength =
        Number(item.selectedLength) === Number(numericLength);
      const isSameColor =
        String(item.selectedColor || "") === String(colorIdString || "");
      return isSameProduct && isSameLength && isSameColor;
    });

    const existingQuantity = existingItem ? Number(existingItem.quantity) || 0 : 0;
    const desiredQuantity = existingQuantity + requestedQuantity;

    if (desiredQuantity > availableStock) {
      return res.status(400).json({
        message: `Only ${availableStock} item(s) available for this selection.`,
      });
    }

    if (existingItem) {
      existingItem.quantity = desiredQuantity;
      // Update price in case it changed in the admin panel since last add
      existingItem.price = finalPrice;
    } else {
      cart.items.push({
        productId: product._id,
        productName: product.productName,
        quantity: requestedQuantity,
        price: finalPrice, // Use the dynamically calculated price
        image: product.images?.[0],
        selectedLength: numericLength,
        selectedColor: selectedColor || undefined,
      });
    }

    // The pre-save hook in the model will calculate the totals.

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: "items.productId",
        select: "productName images price lengths slug",
      })
      .populate({
        path: "items.selectedColor",
        select: "name hex",
      });

    res.status(200).json({
      message: "Product added to cart successfully.",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("CART ERROR:", error);
    console.log(error.message);
    res.status(500).json({
      message: "Unable to add product to cart.",
      error: error.message,
      stack: error.stack,
    });
  }
}

// Get cart
export async function getCart(req, res) {
  try {
    // Check for authenticated user first, then fallback to sessionId from query
    const userId = req.user?.id;
    const { sessionId } = req.query;

    if (!userId && !sessionId) {
      return res
        .status(400)
        .json({ message: "User ID or Session ID is required." });
    }

    // Build the query dynamically
    const query = userId ? { userId } : { sessionId };

    const cart = await Cart.findOne(query)
      .populate({
        path: "items.productId",
        select: "productName images price lengths slug",
      })
      .populate({
        path: "items.selectedColor",
        select: "name hex",
      });

    if (!cart) {
      return res.status(200).json({
        message: "No cart found. Returning empty",
        cart: { items: [], totalPrice: 0, totalItems: 0 },
      });
    }

    res.status(200).json({
      message: "Cart retrieved successfully.",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to retrieve cart",
      error: error.message,
    });
  }
}

// Update cart
export async function updateCart(req, res) {
  try {
    const { sessionId, productId, quantity, selectedLength, selectedColor } =
      req.body;
    const userId = req.user?.id;

    if (!userId && !sessionId) {
      return res
        .status(400)
        .json({ message: "User ID or Session ID is required." });
    }

    if (!productId || quantity === undefined) {
      return res
        .status(400)
        .json({ message: "Product ID and quantity are required" });
    }

    // Find the cart using whichever ID that's available
    const query = userId ? { userId } : { sessionId };
    const cart = await Cart.findOne(query);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    const newQuantity = Number(quantity);
    if (Number.isNaN(newQuantity)) {
      return res.status(400).json({ message: "Quantity must be a number." });
    }

    if (newQuantity <= 0) {
      // Remove items from array, if quantity is zero
      cart.items = cart.items.filter(
        (item) =>
          !(
            item.productId.toString() === productId &&
            Number(item.selectedLength) === Number(selectedLength) &&
            String(item.selectedColor || "") === String(selectedColor || "")
          ),
      );
    } else {
      // Find and Update the quantity

      const item = cart.items.find(
        (item) =>
          item.productId.toString() === productId &&
          Number(item.selectedLength) === Number(selectedLength) &&
          String(item.selectedColor || "") === String(selectedColor || ""),
      );

      if (!item) {
        return res.status(404).json({ message: "Item not found in cart." });
      }

      const product = await Product.findById(productId).select(
        "inventory lengths",
      );
      if (!product) {
        return res.status(404).json({ message: "Product not found." });
      }

      const numericLength =
        selectedLength === undefined || selectedLength === null || selectedLength === ""
          ? null
          : Number(selectedLength);

      const {
        availableStock,
        error: lengthError,
      } = resolveLengthStock(product, numericLength);

      if (lengthError) {
        return res.status(400).json({ message: lengthError });
      }

      if (newQuantity > availableStock) {
        return res.status(400).json({
          message: `Only ${availableStock} item(s) available for this selection.`,
        });
      }

      item.quantity = newQuantity;
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: "items.productId",
        select: "productName images price lengths slug",
      })
      .populate({
        path: "items.selectedColor",
        select: "name hex",
      });

    res.status(200).json({
      message:
        newQuantity <= 0
          ? "Item removed from cart"
          : "Cart updated successfully.",
      cart: populatedCart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to update cart",
      error: error.message,
    });
  }
}

// Remove item from cart
export async function removeFromCart(req, res) {
  try {
    const { sessionId, productId, selectedLength, selectedColor } = req.body;
    const userId = req.user?.id;

    if (!userId && !sessionId) {
      return res
        .status(400)
        .json({ message: "User ID or Session ID is required." });
    }

    const query = userId ? { userId } : { sessionId };
    let cart = await Cart.findOne(query);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.productId.toString() === productId &&
          Number(item.selectedLength) === Number(selectedLength) &&
          String(item.selectedColor || "") === String(selectedColor || "")
        ),
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: "items.productId",
        select: "productName images price lengths slug",
      })
      .populate({
        path: "items.selectedColor",
        select: "name hex",
      });

    res.status(200).json({
      message: "Item removed from cart successfully.",
      cart: populatedCart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to remove item from cart.",
      error: error.message,
    });
  }
}

// Clear cart
export async function clearCart(req, res) {
  try {
    const { sessionId } = req.body;
    const userId = req.user?.id;

    if (!userId && !sessionId) {
      return res
        .status(400)
        .json({ message: "User ID or Session ID is required." });
    }

    const query = userId ? { userId } : { sessionId };
    const cart = await Cart.findOne(query);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    cart.items = [];

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: "items.productId",
        select: "productName images price lengths slug",
      })
      .populate({
        path: "items.selectedColor",
        select: "name hex",
      });

    res.status(200).json({
      message: "Cart cleared successfully.",
      cart: populatedCart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to clear cart.",
      error: error.message,
    });
  }
}

// To completely delete the cart
// export async function clearCart(req, res) {
//   try {
//     const { userId } = req.body;

//     const deletedCart = await Cart.findOneAndDelete({ userId });

//     if (!deletedCart) {
//       return res.status(404).json({ message: "Cart not found." });
//     }

//     res.status(200).json({
//       message: "Cart cleared successfully.",
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Unable to clear cart.", error: error.message });
//   }
// }

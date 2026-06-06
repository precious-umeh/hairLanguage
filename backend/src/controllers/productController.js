import Product from "../models/product.js";
import fs from "fs";
import path from "path";
import { deleteFromCloudinary } from "../middlewares/file-upload.js";

const LENGTH_GROUPS = {
  short: { min: 8, max: 14 },
  medium: { min: 16, max: 20 },
  long: { min: 22, max: Infinity },
};

const toPositiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isTruthyFlag = (value) => {
  return value === true || value === "true" || value === "1" || value === 1;
};

const getLengthRange = (value) => {
  if (!value) return null;
  return LENGTH_GROUPS[value] || null;
};

const lengthInRange = (length, range) => {
  const size = Number(length?.size);
  if (!Number.isFinite(size)) return false;
  return size >= range.min && size <= range.max;
};

const getAvailableLengths = ({
  lengths = [],
  inStockOnly = false,
  range = null,
}) => {
  return lengths.filter((length) => {
    const inventory = Number(length?.inventory) || 0;
    if (inStockOnly && inventory <= 0) return false;
    if (range && !lengthInRange(length, range)) return false;
    return true;
  });
};

const hasBaseStock = (product) => (Number(product?.inventory) || 0) > 0;

// retrive all products
export async function getProducts(req, res) {
  try {
    const {
      category,
      texture,
      type,
      length,
      minPrice,
      maxPrice,
      inStock,
      hideOutOfStock,
    } = req.query;

    const query = {};
    if (category) query.category = category;
    if (texture) query.texture = texture;
    if (type) query.wigType = type;

    const products = await Product.find(query)
      .populate("availableColors")
      .lean();

    const inStockOnly = isTruthyFlag(inStock) || isTruthyFlag(hideOutOfStock);
    const lengthRange = getLengthRange(length);
    const min = minPrice !== undefined ? toPositiveNumber(minPrice, 0) : null;
    const max =
      maxPrice !== undefined ? toPositiveNumber(maxPrice, Infinity) : null;

    const filteredProducts = products
      .map((product) => {
        const hasLengths =
          Array.isArray(product.lengths) && product.lengths.length > 0;

        if (!hasLengths) {
          if (inStockOnly && !hasBaseStock(product)) return null;

          if (min !== null || max !== null) {
            const price = Number(product.price) || 0;
            const minValue = min ?? 0;
            const maxValue = max ?? Infinity;
            if (price < minValue || price > maxValue) return null;
          }

          return product;
        }

        const visibleLengths = getAvailableLengths({
          lengths: product.lengths,
          inStockOnly,
          range: lengthRange,
        });

        if (visibleLengths.length === 0) return null;

        if (min !== null || max !== null) {
          const minValue = min ?? 0;
          const maxValue = max ?? Infinity;
          const hasMatchingPrice = visibleLengths.some((len) => {
            const price = Number(len?.price) || 0;
            return price >= minValue && price <= maxValue;
          });
          if (!hasMatchingPrice) return null;
        }

        return {
          ...product,
          lengths:
            inStockOnly || lengthRange ? visibleLengths : product.lengths,
        };
      })
      .filter(Boolean);

    if (filteredProducts.length === 0) {
      return res.status(404).json({
        message: "No products found in the database",
      });
    }
    res.status(200).json({
      message: "Products retrieved successfully",
      count: filteredProducts.length,
      products: filteredProducts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}

// retrieve one product (id)
export async function getOneProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id).populate(
      "availableColors",
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not available",
      });
    }

    res.status(200).json({
      message: "Product retrieved successfully",
      product: product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Invalid ID format",
      error: error.message,
    });
  }
}

// retrieve one product (slug)
export async function getOneProductBySlug(req, res) {
  try {
    const product = await Product.findOne({
      slug: req.params.slug.toLowerCase(),
    }).populate("availableColors");

    if (!product) {
      return res.status(404).json({
        message: "Product not available",
      });
    }

    res.status(200).json({
      message: "Product retrieved successfully",
      product: product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Invalid Slug",
      error: error.message,
    });
  }
}

// Helper function to extract and format data from the request
const prepareProductData = (req) => {
  const data = { ...req.body };

  if (data.lengths) {
    try {
      // If its a string parse it into array of objects
      let parsedLengths =
        typeof data.lengths === "string"
          ? JSON.parse(data.lengths)
          : data.lengths;

      // Ensure each entry is a clean object with Numbers
      data.lengths = parsedLengths.map((item) => ({
        size: Number(item.size),
        price: Number(item.price),
        inventory: Number(item.inventory || 0),
      }));
    } catch (error) {
      console.error("Error formatting lengths: ", error);
      data.lengths = [];
    }
  }

  // const newImages = req.files
  //   ? req.files.map((f) => `/uploads/${f.filename}`)
  //   : [];

  const newImages = req.files ? req.files.map((f) => f.path) : [];

  let existingImages = [];
  if (data.images) {
    existingImages = Array.isArray(data.images) ? data.images : [data.images];
  }

  data.images = [...existingImages, ...newImages];

  return data;
};

// add a new product
export async function addProduct(req, res) {
  try {
    const productData = prepareProductData(req);

    // Validate base price
    if (productData.price <= 0) {
      return res.status(400).json({
        message: "Price must be greater than 0",
      });
    }

    // Validate variation price
    const hasInvalidPrice = productData.lengths.some((l) => l.price <= 0);
    if (hasInvalidPrice) {
      return res.status(400).json({
        message: "All length variations must have a price greater than 0",
      });
    }

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: "Product added successfully",
      data: savedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}

// update a product
export async function updateProduct(req, res) {
  try {
    const productData = prepareProductData(req);

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Update field manually
    Object.assign(product, productData);

    // .save() triggers the pre("save") middleware
    const updatedProduct = await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to update product",
      error: error.message,
    });
  }
}

// delete product
export async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Loop through the images and delete from the disk
    if (product.images && product.images.length > 0) {
      product.images.forEach((imagePath) => {
        // Only delete if it's a local path (starts with /uploads)
        // This avoids trying to delete external URLs
        if (imagePath.startsWith("/uploads")) {
          // Construct the absolute path to the file
          // 'process.cwd()' gets the root directory of your project
          const fullPath = path.join(process.cwd(), imagePath);

          // Delete the file
          fs.unlink(fullPath, (err) => {
            if (err) {
              console.error(
                `Failed to delete image at ${fullPath}:`,
                err.message,
              );
            } else {
              console.log(`Successfully deleted: ${imagePath}`);
            }
          });
        } else if (imagePath.includes("cloudinary.com")) {
          deleteFromCloudinary(imagePath);
        }
      });
    }

    // Delete product from Database
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Prdouct deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Unable to delete product",
      error: error.message,
    });
  }
}

// export async function deleteProduct(req, res) {
//   try {
//     const deletedProduct = await Product.findByIdAndDelete(req.params.id);

//     if (!deletedProduct) {
//       return res.status(404).json({
//         message: "Product not found",
//       });
//     }

//     res.status(200).json({
//       message: "Product deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Unable to delete product",
//       error: error.message,
//     });
//   }
// }

// const prepareProductData = (req) => {
//   const data = { ...req.body };

//   // if (typeof data.lengths === "string") {
//   //   data.lengths = data.lengths.split(",").map(Number);
//   // }

//   if (data.lengths) {
//     // If it's a string (comma separated), split it.
//     // If it's already an array, just map it to Numbers
//     const lengthsArray = Array.isArray(data.lengths)
//       ? data.lengths
//       : data.lengths.split(",");

//     data.lengths = lengthsArray.map(Number);
//   }

//   // if (req.files && req.files.length > 0) {
//   //   data.images = req.files.map((image) => `/uploads/${image.filename}`);
//   // }
//   const newImages = req.files
//     ? req.files.map((f) => `/uploads/${f.filename}`)
//     : [];

//   let existingImages = [];
//   if (data.images) {
//     existingImages = Array.isArray(data.images) ? data.images : [data.images];
//   }

//   data.images = [...existingImages, ...newImages];

//   return data;
// };

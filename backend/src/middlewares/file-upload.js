import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

// Configure cloudinary using env config
cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

const uploadsFolder = "uploads";
if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsFolder);
  },
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${Math.random() * 1e8}${path.extname(file.originalname)}`;
    cb(null, name);
  },
});

const fileValidation = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|avif/;
  const extensionName = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimeType = allowedFileTypes.test(file.mimetype);

  if (extensionName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error(`Only jpeg,jpg,png,gif,avif files are allowed`), false);
  }
};

const upload = multer({ storage, fileFilter: fileValidation });

/**
 * Middleware to upload local files to Cloudinary and delete the local temp files.
 * This runs after Multer parses and saves the files locally.
 */
export const uploadToCloudinary = async (req, res, next) => {
  try {
    // Single file upload (e.g user/admin avatar)
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "hair-language/avatars",
      });
      // Delete the temporary local file asychronously
      fs.unlink(req.file.path, (err) => {
        if (err)
          console.error(`Failed to delete temp file: ${req.file.path}`, err);
      });
      // Override the path to be the secure Cloudinary URL
      req.file.path = result.secure_url;
    }

    // Multiple file uploads (e.g product images)
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "hair-language/products",
        });
        // Delete the temporary local file asynchronously
        fs.unlink(file.path, (err) => {
          if (err)
            console.error(`Failed to delete temp file: ${file.path}`, err);
        });
        // Override the path to be the secure Cloudinary URL
        file.path = result.secure_url;
      });
      await Promise.all(uploadPromises);
    }

    next();
  } catch (error) {
    // If upload fails, clean up local temp files
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => fs.unlink(file.path, () => {}));
    }

    return res.status(500).json({
      message: "Image upload failed",
      error: error.message,
    });
  }
};

/**
 * Helper to delete files from Cloudinary by URL
 */
export const deleteFromCloudinary = async (url) => {
  try {
    if (!url) return;
    // Regular expression extracts folder path and public_id without extensions
    const match = url.match(/\/upload\/(?:v\d+\/)?(.*?)(?:\.[^.]+)?$/);

    if (match && match[1]) {
      const publicId = match[1];
      await cloudinary.uploader.destroy(publicId);
      console.log(`Successfully deleted from Cloudinary: ${publicId}`);
    }
  } catch (error) {
    console.error("Failed to delete image from Cloudinary:", error.message);
  }
};

export default upload;

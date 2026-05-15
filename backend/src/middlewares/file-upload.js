import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsFolder = "uploads";
if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsFolder);
  },
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${Math.random() * 1e8}-${path.extname(file.originalname)}`;
    cb(null, name);
  },
});

const fileValidation = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|avif/;
  const extensionName = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimeType = allowedFileTypes.test(file.mimeType);

  if (extensionName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error(`Only jpeg,jpg,png,gif,avif files are allowed`));
  }
};

const upload = multer({ storage, fileValidation });

export default upload;

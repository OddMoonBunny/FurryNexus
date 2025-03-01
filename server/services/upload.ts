import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Use UUID for unique filenames
    const uuid = uuidv4();
    cb(null, uuid + path.extname(file.originalname));
  },
});

// Create multer instance
export const upload = multer({ storage });

// Helper to get file URL
export function getFileUrl(filename: string): string {
  return `/uploads/${filename}`;
}
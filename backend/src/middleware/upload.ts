import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { AppError } from "./errorHandler.js";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Invalid file format. Please upload a JPG, PNG, WEBP, or PDF payment slip.",
        400,
        "INVALID_FILE_TYPE"
      )
    );
  }
};

export const uploadSlipMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter,
});

const THUMBNAIL_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const thumbnailFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (THUMBNAIL_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Invalid file format. Please upload a JPG, PNG, WEBP, or GIF image for the template thumbnail.",
        400,
        "INVALID_FILE_TYPE"
      )
    );
  }
};

export const uploadThumbnailMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter: thumbnailFileFilter,
});

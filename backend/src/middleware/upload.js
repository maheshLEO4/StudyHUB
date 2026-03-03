/**
 * Multer File Upload Configuration
 * Supports PDFs, images, and common documents up to 10 MB
 */
const multer = require('multer');
const path = require('path');
const { v4: uuid } = require('uuid');
const AppError = require('../utils/AppError');

const ALLOWED_TYPES = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|md/;
const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // 10 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuid()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const mime = file.mimetype;
  if (ALLOWED_TYPES.test(ext) || ALLOWED_TYPES.test(mime)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type not allowed. Allowed: ${ALLOWED_TYPES.source}`, 400), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });

module.exports = upload;

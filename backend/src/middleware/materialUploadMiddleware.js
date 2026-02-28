import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '../../uploads');

export const MAX_MATERIAL_FILE_SIZE_BYTES = 100 * 1024 * 1024;

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

const ensureUploadsDir = () => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      ensureUploadsDir();
      cb(null, uploadsDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (_req, file, cb) => {
    const originalExt = path.extname(file.originalname || '').slice(0, 12);
    const safeExt = originalExt && originalExt.startsWith('.') ? originalExt : '';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${safeExt}`);
  }
});

export const materialUpload = multer({
  storage,
  limits: { fileSize: MAX_MATERIAL_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      const err = new Error(
        'Invalid file type. Allowed: PDF, PPT, PPTX, DOC, DOCX.'
      );
      err.code = 'INVALID_FILE_TYPE';
      err.statusCode = 400;
      cb(err);
      return;
    }
    cb(null, true);
  }
});

export const uploadMaterialFile = materialUpload.single('file');


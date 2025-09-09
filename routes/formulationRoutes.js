import express from 'express';
import multer from 'multer';
import path from 'path';
import { createFormulation } from '../controllers/formulationController.js';

const router = express.Router();

// Configuración de multer para PDF
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/evidencias'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};
const upload = multer({ storage, fileFilter });

router.post('/', upload.single('pdf'), createFormulation);

export default router;

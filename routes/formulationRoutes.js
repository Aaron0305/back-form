import express from 'express';
import { createFormulation, getAllFormulations } from '../controllers/formulationController.js';
import { upload, uploadToCloud, handleMulterError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Ruta para obtener todos los registros de formulación para el panel de admin
router.get('/', getAllFormulations);

// Usar multer con almacenamiento en memoria y subir a Cloudinary via middleware
// Aceptamos solo un archivo 'pdf' y delegamos validación de tipo/tamaño al middleware
router.post('/', upload.single('pdf'), uploadToCloud, createFormulation);

export default router;


import express from 'express';
const router = express.Router();
import { createFormulation, getAllFormulations, importFormulationsFromCsv } from '../controllers/formulationController.js';
import { upload, uploadToCloud, handleMulterError } from '../middleware/uploadMiddleware.js';
// Importación masiva desde CSV (JSON)
router.post('/import-csv', importFormulationsFromCsv);

// Ruta para obtener todos los registros de formulación para el panel de admin
router.get('/', getAllFormulations);

// Usar multer con almacenamiento en memoria y subir a Cloudinary via middleware
// Aceptamos solo un archivo 'pdf' y delegamos validación de tipo/tamaño al middleware
router.post('/', upload.single('pdf'), uploadToCloud, createFormulation);

export default router;

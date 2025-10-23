
import express from 'express';
const router = express.Router();
import { getAllFormulations, importFormulationsFromCsv } from '../controllers/formulationController.js';
import { upload, uploadToCloud, handleMulterError } from '../middleware/uploadMiddleware.js';
// Importación masiva desde CSV (JSON)
router.post('/import-csv', importFormulationsFromCsv);

// Ruta para obtener todos los registros de formulación para el panel de admin
router.get('/', getAllFormulations);

// Usar multer con almacenamiento en memoria y subir a Cloudinary via middleware
// (Ruta POST para crear formulaciones eliminada porque no existe el controlador)

export default router;

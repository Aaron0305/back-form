import Formulation from '../models/formulation.js';
import cloudinary from '../config/cloudinary.js';

export async function createFormulation(req, res) {
  try {
    const { nombre, email, descripcion, promedio, estado, carrera, claveEscuela } = req.body;
    if (!nombre || !email || !descripcion || !promedio || !estado || !carrera || !claveEscuela) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'El PDF es obligatorio.' });
    }
    // Subir PDF a Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'raw',
      folder: 'formulations_pdfs'
    });
    // Guardar solo la URL del PDF en la colección Formulation
    const formulation = new Formulation({
      nombre,
      email,
      descripcion,
      promedio,
      estado,
      carrera,
      claveEscuela,
      pdfUrl: result.secure_url
    });
    await formulation.save();
    res.status(201).json({ message: 'Formulario guardado correctamente.', formulation });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar el formulario.' });
  }
}

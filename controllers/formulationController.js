import Formulation from '../models/Formulation.js';
import cloudinary from '../config/cloudinary.js';
import emailService from '../services/emailService.js';

export async function createFormulation(req, res) {
  try {
    const { 
      nombre, 
      apellidoPaterno, 
      apellidoMaterno, 
      curp, 
      telefonoCasa, 
      telefonoCelular, 
      correoPersonal, 
      correoInstitucional,
      institucion, 
      carrera, 
      promedio, 
      estado 
    } = req.body;

    // Validar campos obligatorios
    if (!nombre || !apellidoPaterno || !apellidoMaterno || !curp || !telefonoCasa || !telefonoCelular || !correoPersonal || !institucion || !carrera || !promedio || !estado) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados.' });
    }

    // Validar formato de CURP
    if (curp.length !== 18) {
      return res.status(400).json({ error: 'El CURP debe tener exactamente 18 caracteres.' });
    }

    // Validar que el promedio esté en rango válido
    const promedioNum = parseFloat(promedio);
    if (promedioNum < 0 || promedioNum > 10) {
      return res.status(400).json({ error: 'El promedio debe estar entre 0 y 10.' });
    }

    let pdfUrl = null;

    // Subir PDF a Cloudinary si existe
    if (req.file) {
      // El middleware de subida ya debe haber subido el archivo a Cloudinary
      // y colocado la URL en req.file.cloudinaryUrl
      if (req.file.cloudinaryUrl) {
        pdfUrl = req.file.cloudinaryUrl;
      } else {
        // En caso de que todavía venga como path (fallback), intentar subir
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'raw',
            folder: 'formulations_pdfs',
            public_id: `${curp}_${Date.now()}`,
            use_filename: true
          });
          pdfUrl = result.secure_url;
        } catch (uploadError) {
          console.error('Error uploading PDF fallback:', uploadError);
          return res.status(500).json({ error: 'Error al subir el documento PDF.' });
        }
      }
    }

    // Crear nueva formulación
    const formulation = new Formulation({
      nombre: nombre.trim(),
      apellidoPaterno: apellidoPaterno.trim(),
      apellidoMaterno: apellidoMaterno.trim(),
      curp: curp.toUpperCase().trim(),
      telefonoCasa: telefonoCasa.trim(),
      telefonoCelular: telefonoCelular.trim(),
      correoPersonal: correoPersonal.toLowerCase().trim(),
      correoInstitucional: correoInstitucional ? correoInstitucional.toLowerCase().trim() : undefined,
      institucion: institucion.trim(),
      carrera: carrera.trim(),
      promedio: promedioNum,
      estado,
      pdfUrl
    });

    await formulation.save();
    // Enviar correo de confirmación de registro (no bloquear la respuesta si falla)
    try {
      await emailService.sendFormSubmissionConfirmation(formulation.correoPersonal, {
        nombre: formulation.nombre,
        apellidoPaterno: formulation.apellidoPaterno,
        apellidoMaterno: formulation.apellidoMaterno,
        institucion: formulation.institucion,
        carrera: formulation.carrera
      });
    } catch (emailError) {
      console.error('Error enviando correo de confirmación:', emailError);
    }
    res.status(201).json({ 
      message: 'Formulario guardado correctamente.', 
      formulation: {
        id: formulation._id,
        nombre: formulation.nombre,
        apellidoPaterno: formulation.apellidoPaterno,
        apellidoMaterno: formulation.apellidoMaterno,
        correoPersonal: formulation.correoPersonal,
        institucion: formulation.institucion,
        carrera: formulation.carrera,
        fecha: formulation.fecha
      }
    });
  } catch (error) {
    console.error('Error creating formulation:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: `Errores de validación: ${errors.join(', ')}` });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Ya existe un registro con este correo o CURP.' });
    }
    
    res.status(500).json({ error: 'Error interno del servidor al guardar el formulario.' });
  }
}

export async function getAllFormulations(req, res) {
  try {
    // Obtener todos los registros y ordenarlos por fecha de creación descendente
    const formulations = await Formulation.find({}).sort({ fecha: -1 });
    res.status(200).json(formulations);
  } catch (error) {
    console.error('Error al obtener los registros de formulación:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener los registros.' });
  }
}

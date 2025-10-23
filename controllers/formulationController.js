// Importación masiva desde CSV (JSON)
export async function importFormulationsFromCsv(req, res) {
  try {
    const { registros } = req.body;
    if (!Array.isArray(registros) || registros.length === 0) {
      return res.status(400).json({ error: 'No se recibieron registros para importar.' });
    }
    // Importación flexible: solo se requiere 'curp', el resto de campos se insertan si existen
    const docs = [];
    const errores = [];
      // Normaliza encabezados: quita acentos, espacios, guiones, mayúsculas, etc.
      const normalize = s => String(s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // quita acentos
        .replace(/[^a-z0-9]/g, ''); // deja solo letras y números
    // Mapeo de posibles nombres de campos a los nombres internos
      // Mapeo de variantes para cada campo
      const camposMap = {
    nombre: ['nombre', 'nombrealumno', 'nombre-alumno', 'nombre alumno', 'nombres'],
    apellidoPaterno: ['apellidopaterno', 'apellido-paterno', 'apellido paterno', 'apellidop', 'apellidopaternoalumno'],
    apellidoMaterno: ['apellidomaterno', 'apellido-materno', 'apellido materno', 'apellidom', 'apellidomaternoalumno'],
    curp: ['curp', 'curp-alumno', 'curp alumno', 'curp_alumno'],
    telefonoCasa: ['telefonocasa', 'telefono-casa', 'telefono casa', 'telcasa', 'telcasaalumno'],
    telefonoCelular: ['telefonocelular', 'telefono-celular', 'telefono celular', 'telcel', 'telcelalumno'],
    correoPersonal: ['correopersonal', 'correo-personal', 'correo personal', 'email', 'emailpersonal', 'correo'],
    correoInstitucional: ['correoinstitucional', 'correo-institucional', 'correo institucional', 'emailinstitucional'],
    institucion: ['institucion', 'institución', 'institucion-alumno', 'institucion alumno'],
    carrera: ['carrera', 'carrera-alumno', 'carrera alumno'],
    promedio: ['promedio', 'promedio-alumno', 'promedio alumno'],
    estado: ['estado', 'estatus', 'estatusalumno', 'estadoalumno'],
    grupo: ['grupo', 'grupo-alumno', 'grupo alumno'],
    pdfUrl: ['pdfurl', 'pdf-url', 'pdf url'],
  fulfilled: ['fulfilled', 'cumplidos', 'requisitoscumplidos']
      };
    for (const [i, row] of registros.entries()) {
      const obj = {};
      // Mapear solo los campos presentes en el CSV
      for (const key in camposMap) {
        const posibles = camposMap[key];
        for (const encabezado in row) {
          if (posibles.includes(normalize(encabezado))) {
            obj[key] = row[encabezado];
            break;
          }
        }
      }
      // Solo se requiere curp para importar
      if (!obj.curp) {
        errores.push({ fila: i + 1, error: 'Falta el campo CURP.' });
        continue;
      }
      // Validar formato de CURP si existe
      if (obj.curp && String(obj.curp).length !== 18) {
        errores.push({ fila: i + 1, error: 'CURP debe tener 18 caracteres.' });
        continue;
      }
      // Si promedio existe, validar rango
      let promedioNum = undefined;
      if (obj.promedio !== undefined && obj.promedio !== null && obj.promedio !== '') {
        promedioNum = parseFloat(obj.promedio);
        if (isNaN(promedioNum) || promedioNum < 0 || promedioNum > 10) {
          errores.push({ fila: i + 1, error: 'Promedio fuera de rango.' });
          continue;
        }
      }
      // Si correoPersonal existe, validar formato
      if (obj.correoPersonal && !/^\S+@\S+\.\S+$/.test(obj.correoPersonal)) {
        errores.push({ fila: i + 1, error: 'Correo personal inválido.' });
        continue;
      }
      // Preparar documento solo con los campos presentes
      const doc = { curp: String(obj.curp).toUpperCase().trim() };
      for (const key in obj) {
        if (key === 'curp') continue;
        if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
          if (key === 'promedio') {
            doc[key] = promedioNum;
          } else if (key === 'correoPersonal') {
            doc[key] = obj[key].toLowerCase().trim();
          } else if (key === 'estado') {
            doc[key] = String(obj[key]).toLowerCase();
          } else if (key === 'fulfilled') {
            doc[key] = Array.isArray(obj[key]) ? obj[key] : [];
          } else {
            doc[key] = String(obj[key]).trim();
          }
        }
      }
      docs.push(doc);
    }
    // Insertar en lote, omitir duplicados por curp
    const bulkOps = docs.map(doc => ({
      updateOne: {
        filter: { curp: doc.curp },
        update: { $setOnInsert: doc },
        upsert: true
      }
    }));
    if (bulkOps.length > 0) {
      const result = await (await import('../models/Formulation.js')).default.bulkWrite(bulkOps, { ordered: false });
      res.status(200).json({ message: 'Importación completada.', errores });
    } else {
      res.status(400).json({ error: 'No se insertó ningún registro.', errores });
    }
    } catch (error) {
      console.error('Error en importación masiva:', error);
      res.status(500).json({ error: 'Error interno al importar registros.' });
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

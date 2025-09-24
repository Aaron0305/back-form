import mongoose from 'mongoose';

const FormulationSchema = new mongoose.Schema({
	// Información Personal
	nombre: {
		type: String,
		required: true,
		trim: true
	},
	apellidoPaterno: {
		type: String,
		required: true,
		trim: true
	},
	apellidoMaterno: {
		type: String,
		required: true,
		trim: true
	},
	curp: {
		type: String,
		required: true,
		trim: true,
		uppercase: true,
		minlength: 18,
		maxlength: 18
	},
	telefonoCasa: {
		type: String,
		required: true,
		trim: true
	},
	telefonoCelular: {
		type: String,
		required: true,
		trim: true
	},
	correoPersonal: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		match: [/^\S+@\S+\.\S+$/, 'Email inválido']
	},
	correoInstitucional: {
		type: String,
		trim: true,
		lowercase: true,
		match: [/^\S+@\S+\.\S+$/, 'Email inválido']
	},
	// Información Académica
	institucion: {
		type: String,
		required: true,
		trim: true
	},
	carrera: {
		type: String,
		required: true,
		trim: true
	},
	promedio: {
		type: Number,
		required: true,
		min: 0,
		max: 10
	},
	estado: {
		type: String,
		enum: ['regular', 'irregular'],
		required: true
	},
	// Archivo PDF
	pdfUrl: {
		type: String,
		trim: true
	},
	// Metadatos
	fecha: {
		type: Date,
		default: Date.now
	},
	activo: {
		type: Boolean,
		default: true
	}
});

// Índices para mejorar las consultas
FormulationSchema.index({ correoPersonal: 1 });
FormulationSchema.index({ curp: 1 }, { unique: true });
FormulationSchema.index({ fecha: -1 });

// Middleware para validar CURP antes de guardar
FormulationSchema.pre('save', function(next) {
	if (this.curp) {
		this.curp = this.curp.toUpperCase();
	}
	next();
});

const Formulation = mongoose.model('Formulation', FormulationSchema);
export default Formulation;

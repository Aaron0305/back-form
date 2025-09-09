import mongoose from 'mongoose';

const FormulationSchema = new mongoose.Schema({
	nombre: {
		type: String,
		required: true,
		trim: true
	},
	email: {
		type: String,
		required: true,
		trim: true,
		match: [/^\S+@\S+\.\S+$/, 'Email inválido']
	},
	descripcion: {
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
	pdfUrl: {
		type: String,
		required: true,
		trim: true
	},
	fecha: {
		type: Date,
		default: Date.now
	}
});

const Formulation = mongoose.model('Formulation', FormulationSchema);
export default Formulation;

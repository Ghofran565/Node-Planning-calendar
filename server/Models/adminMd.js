import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: [true, 'FirstName is required'],
			minLength: [2, 'FirstName must be at least 2 characters long'],
			maxLength: [50, 'FirstName cannot exceed 50 characters'],
			match: [/^[a-zA-Z]+$/, 'FirstName invalid'],
		},
		lastName: {
			type: String,
			required: [true, 'LastName is required'],
			minLength: [2, 'LastName must be at least 2 characters long'],
			maxLength: [50, 'LastName cannot exceed 50 characters'],
			match: [/^[a-zA-Z]+$/, 'LastName invalid'],
		},
		nationalId: {
			type: String,
			required: [true, 'NationalId is required'],
			match: [/^[0-9]{10}$/, 'NationalId is invalid.'],
		},
		email: {
			type: String,
			required: [true, 'Email is required.'],
			unique: [true, 'Email already used.'],
			match: [/[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/, 'Email is invalid.'],
		},
		password: {
			type: String,
		},
		studentsIds: {
			type: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
				},
			],
			default: [],
		},
		role: {
			type: String,
			required: [true, 'Role is required.'],
			enum: ['parent', 'supporter', 'admin'],
		},
		isConfirming: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;

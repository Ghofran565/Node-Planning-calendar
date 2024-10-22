import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
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
		fatherName: {
			type: String,
			required: [true, 'FatherName is required'],
			minLength: [2, 'FatherName must be at least 2 characters long'],
			maxLength: [50, 'FatherName cannot exceed 50 characters'],
			match: [/^[a-zA-Z]+$/, 'LastName invalid'],
		},
		nationalId: {
			type: String,
			required: [true, 'NationalId is required'],
			match: [/^[0-9]{10}$/g, 'NationalId is invalid.'],
		},
		brithday: {
			type: Date,
			required: [true, 'Brithday is required'],
		},
		email: {
			type: String,
			required: [true, 'Email is required.'],
			unique: [true, 'Email already used.'],
			match: [/[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/g, 'Email is invalid.'],
		},
		password: {
			type: String,
		},
		supporterIds: {
			type: [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Admin',
				},
			],
			default: [],
		},
		gradeIn: {
			type: String,
			required: [true, 'GradeIn is required.'],
			enum: [
				'7th',
				'8th',
				'9th',
				'experimental-10th',
				'experimental-11th',
				'experimental-12th',
				'mathematics-10th',
				'mathematics-11th',
				'mathematics-12th',
				'humanities-10th',
				'humanities-11th',
				'humanities-12th',
			],
		},
		preferedCourses: {
			type: {
				name: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Courses',
				},
				isImpo: {
					type: Boolean,
					default: false,
				},
			},
			default: [],
		},
	},
	{ timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;

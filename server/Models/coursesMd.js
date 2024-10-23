import mongoose from 'mongoose';

const coursesSchema = new mongoose.Schema({
	name: {
		type: String,
		unique: [true, 'There is a course registered with this name.'],
		required: [true, 'Name is required'],
		minLength: [2, 'Name must be at least 2 characters long'],
		maxLength: [50, 'Name cannot exceed 50 characters'],
		match: [/^[a-zA-Z0-9]+$/, 'Name invalid'],
	},

	preferedGrades: {
		type: [
			{
				type: String,
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
		],
	},
});

const Courses = mongoose.model('Courses', coursesSchema);

export default Courses;

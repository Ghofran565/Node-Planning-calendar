import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
	course: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Courses',
		required: [true, 'Course is required'],
	},
	duration: {
		hours: {
			type: Number,
			default: 0,
			min:0,
			max:23,
		},
		minutes: {
			type: Number,
			default: 0,
			min:0,
			max:59,
		},
	},
	teachDuration: {
		hours: {
			type: Number,
			default: 0,
			min:0,
			max:23,
		},
		minutes: {
			type: Number,
			default: 0,
			min:0,
			max:59,
		},
	},
});

const recordsSchema = new mongoose.Schema({
	date: {
		type: Date,
		required: [true, 'Date is required'],
	},
	supporterComment: {
		type: String,
		minLength: [2, 'SupporterComment must be at least 2 characters long'],
		maxLength: [500, 'SupporterComment cannot exceed 500 characters'],
	},
	parentComment: {
		type: String,
		minLength: [2, 'ParentComment must be at least 2 characters long'],
		maxLength: [500, 'ParentComment cannot exceed 500 characters'],
	},
	studentComment: {
		type: String,
		minLength: [2, 'StudentComment must be at least 2 characters long'],
		maxLength: [500, 'StudentComment cannot exceed 500 characters'],
	},
	isConfirmed: {
		type: Boolean,
		default: false,
	},
	wellbeingPicture: {
		type: String,
	},
	record: [recordSchema],
});

const reportsSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'UserId is required'],
			unique: [true, "This user has it's reports borad"],
		},
		records: [recordsSchema],
	},
	{ timestamps: true }
);

const Reports = mongoose.model('Reports', reportsSchema);

export default Reports;

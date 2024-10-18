import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
	course: {
		type: mongoose.Schema.Types.ObjectId,
		ref: Courses,
		required: [true, 'Course is required'],
	},
	duration: {
		hours: {
			type: Number,
			default: 0,
		},
		minutes: {
			type: Number,
			default: 0,
		},
	},
	teachDuration: {
		hours: {
			type: Number,
			default: 0,
		},
		minutes: {
			type: Number,
			default: 0,
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
		maxLength: [200, 'SupporterComment cannot exceed 200 characters'],
	},
	parentComment: {
		type: String,
		minLength: [2, 'ParentComment must be at least 2 characters long'],
		maxLength: [200, 'ParentComment cannot exceed 200 characters'],
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
		},
		records: [recordsSchema],
	},
	{ timestamps: true }
);

const Reports = mongoose.model('Reports', reportsSchema);

export default Reports;

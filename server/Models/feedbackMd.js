import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema(
	{
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'SenderId is required'],
		},
		title: {
			type: String,
			required: [true, 'Title is required'],
			minLength: [2, 'Title must be at least 2 characters long'],
			maxLength: [100, 'Title cannot exceed 100 characters'],
		},
		title: {
			type: String,
			required: [true, 'Title is required'],
			maxLength: [10000, 'Title cannot exceed 10000 characters'],
		},
	},
	{ timestamps: true }
);

const Feedback = mongoose.model('Feedback', FeedbackSchema);

export default Feedback;

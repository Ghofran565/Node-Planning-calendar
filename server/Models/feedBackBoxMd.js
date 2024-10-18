import mongoose from 'mongoose';

const feedBackBoxSchema = new mongoose.Schema(
	{
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
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

const FeedBackBox = mongoose.model('FeedBackBox', feedBackBoxSchema);

export default FeedBackBox;

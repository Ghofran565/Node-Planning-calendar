import catchAsync from '../Utils/catchAsync.js';
import HandleError from '../Utils/handleError.js';
import Courses from '../Models/coursesMd.js';

//Admin
export const getAllFeedbacks = catchAsync(async (req, res, next) => {
	const data = await Feedback.find().select('-__v');
	return res.status(200).json({
		success: true,
		data: { data },
	});
});




//User & admin
export const getAllmyFeedbacks = catchAsync(async (req, res, next) => {
	const data = await Feedback.find().select('-__v');
	return res.status(200).json({
		success: true,
		data: { data },
	});
});

export const getFeedback = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const data = await Courses.findById(id).select('-__v');

	if (!data) {
		return next(new HandleError(`Course with ID ${id} not found.`, 404));
	}

	return res.status(200).json({
		success: true,
		data: { data },
	});
});

export const createCourse = catchAsync(async (req, res, next) => {
	const course = await Courses.create(req?.body);
	return res.status(201).json({
		success: true,
		message: 'Course created successfully.',
		data: {
			course: {
				name: course.name,
			},
		},
	});
});

export const deleteCourse = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const course = await Courses.findByIdAndDelete(id);
	if (!course) {
		return next(new HandleError('Course not found.', 404));
	}

	return res.status(200).json({
		success: true,
		message: `${course.name} Course deleted successfully, Course ID: ${id} .`,
	});
});


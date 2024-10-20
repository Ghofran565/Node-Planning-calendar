import catchAsync from '../Utils/catchAsync.js';
import HandleError from '../Utils/handleError.js';
import Courses from './../Models/coursesMd.js';

export const getAllCourses = catchAsync(async (req, res, next) => {
	const data = await Courses.find().select('-__v');
	return res.status(200).json({
		success: true,
		data: { data },
	});
});

export const getCourse = catchAsync(async (req, res, next) => {
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

export const updateCourse = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const course = await Courses.findByIdAndUpdate(id, req?.body, {
		new: true,
		runValidators: true,
	});
	if (!course) {
		return next(new HandleError(`Course with ID ${id} not found.`, 404));
	}
	return res.status(200).json({
		success: true,
		message: `Course with ID ${id} updated successfully.`,
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


import bcryptjs from 'bcryptjs';
import catchAsync from '../Utils/catchAsync.js';
import HandleError from '../Utils/handleError.js';
import ApiFeatures from '../Utils/apiFeatures.js';
import User from '../Models/userMd.js';
import Admin from './../Models/adminMd.js';
import Reports from '../Models/reportsMd.js';

const passwordRegex = /(?=.*?[a-z])(?=.*?[0-9]).{8,}$/;

export const getAllUser = catchAsync(async (req, res, next) => {
	const userFeatures = new ApiFeatures(User, req.query)
		.filters()
		.sort()
		.limitFields()
		.paginate()
		.populate();
	const users = await userFeatures.query;
	return res.status(200).json({
		success: true,
		result: data.length,
		data: { users },
	});
});

export const getUser = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const { id: userId, role } = req.decodedToken;
	if (id !== userId && role !== 'admin') {
		return next(new HandleError('You do not have the permission', 401));
	}
	const user = await User.findById(id).select('-password -__v');
	if (!user) {
		return next(new HandleError(`User with ID ${id} not found.`, 404));
	}
	return res.status(200).json({
		success: true,
		data: { user },
	});
});

export const updateUser = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const { nationalId = '', email = '', password = '', ...others } = req?.body;

	const updatedUser = await User.findByIdAndUpdate(id, others, {
		new: true,
		runValidators: true,
	}).select('-password -__v');
	if (!updatedUser) {
		return next(new HandleError(`User with ID ${id} not found.`, 404));
	}

	return res.status(200).json({
		success: true,
		message: `User with ID ${id} updated successfully by admin.`,
		data: {
			user: {
				nationalId: updatedUser.nationalId,
				email: updatedUser.email,
				profileImage: updatedUser.profileImage,
				grade: updatedUser.gradeIn,
			},
		},
	});
});

export const chengePassword = catchAsync(async (req, res, next) => {
	const { id } = req.decodedToken;
	const { oldPass, newPass } = req?.body;

	if (!passwordRegex.test(newPass)) {
		return next(
			new HandleError(
				'Password must be at least 8 characters long and contain at least one letter and one number.',
				400
			)
		);
	}

	const getUser = await User.findById(id);
	if (!getUser) {
		return next(new HandleError('User not found. Please try again.', 404));
	}

	if (!bcryptjs.compareSync(oldPass, getUser.password)) {
		return next(new HandleError('Wrong password. Please try again.', 401));
	}

	if (oldPass == newPass) {
		return next(
			new HandleError('Same password. Can not chenge the password.', 401)
		);
	}

	const hashedPassword = bcryptjs.hashSync(newPass, 10);
	await User.findByIdAndUpdate(
		id,
		{ password: hashedPassword },
		{ new: true, runValidators: true }
	);

	return res.status(200).json({
		success: true,
		message: 'Password changed successfully.',
	});
});

export const createUser = catchAsync(async (req, res, next) => {
	const { nationalId, email, ...others } = req?.body;

	const existingAdmin1 = await Admin.findOne({ nationalId });
	const existingAdmin2 = await Admin.findOne({ email });
	const existingUser1 = await User.findOne({ nationalId });
	const existingUser2 = await User.findOne({ email });
	if (existingAdmin1 || existingUser2 || existingAdmin2 || existingUser1) {
		return next(
			new HandleError(
				'nationalId or email is already registered for another admin or user.',
				400
			)
		);
	}

	const newUser = await User.create(req?.body);

	await Reports.create({
		userId: newUser._id,
	});

	return res.status(201).json({
		success: true,
		message: 'User registered successfully.',
		data: {
			user: {
				nationalId: newUser.nationalId,
				email: newUser.email,
				profileImage: newUser.profileImage,
				grade: newUser.gradeIn,
			},
		},
	});
});

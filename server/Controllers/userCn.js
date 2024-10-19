import bcryptjs from 'bcryptjs';
import catchAsync from '../Utils/catchAsync.js';
import HandleError from '../Utils/handleError.js';
import ApiFeatures from '../Utils/apiFeatures.js';
import User from '../Models/userMd.js';

const passwordRegex = /(?=.*?[a-z])(?=.*?[0-9]).{8,}$/g;

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
		data: { users },
	});
});

export const getUser = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const { id: userId, role } = req.decodedToken;
	if (id !== userId && role !== 'admin') {
		return next(new HandleError('You do not have the premission', 401));
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
	const updatedUser = await User.findByIdAndUpdate(
		id,
		req?.body,
		{
			new: true,
			runValidators: true,
		}
	).select('-password -__v');

	return res.status(200).json({
		success: true,
		message: `User with ID ${id} updated successfully by admin.`,
		data: {
			user: {
				nationalId: updatedUser.nationalId,
				email: updatedUser.email,
				profileImage: updatedUser.profileImage,
			},
		},
	});
});

export const chengePassword = catchAsync(async (req, res, next) => {
	const { id } = req.decodedToken;
	const { id: bodyId, oldPass, newPass } = req?.body;

	if (id !== bodyId) {
		return next(
			new HandleError('Unauthorized request. User ID mismatch.', 401)
		);
	}

	if (!passwordRegex.test(newPass)) {
		return next(
			new HandleError(
				'Password must be at least 8 characters long and contain at least one letter and one number.',
				400
			)
		);
	}

	const getuser = await User.findById(id);
	if (!getuser) {
		return next(new HandleError('User not found. Please try again.', 404));
	}

	if (!bcryptjs.compareSync(oldPass, getuser.password)) {
		return next(new HandleError('Wrong password. Please try again.', 401));
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
	const { nationalId, password, ...others } = req?.body;
	if (!passwordRegex.test(password)) {
		return next(
			new HandleError(
				'Password must be at least 8 characters long and contain at least one letter and one number.',
				400
			)
		);
	}

	const existingUser = await User.findOne({ nationalId });
	if (existingUser) {
		return next(new HandleError('nationalId is already registered.', 400));
	}

	const hashedPassword = bcryptjs.hashSync(password, 10);

	const newUser = await User.create({
		nationalId,
		password: hashedPassword,
		...others,
	});

	return res.status(201).json({
		success: true,
		message: 'User registered successfully.',
		data: {
			user: {
				nationalId: newUser.nationalId,
				email: newUser.email,
				profileImage: newUser.profileImage,
			},
		},
	});
});

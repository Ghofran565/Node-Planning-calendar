import bcryptjs from 'bcryptjs';
import catchAsync from '../Utils/catchAsync.js';
import HandleError from '../Utils/handleError.js';
import ApiFeatures from '../Utils/apiFeatures.js';
import Admin from './../Models/adminMd.js';
import User from '../Models/userMd.js';

const passwordRegex = /(?=.*?[a-z])(?=.*?[0-9]).{8,}$/;

export const getAllAdmin = catchAsync(async (req, res, next) => {
	const features = new ApiFeatures(Admin, req.query)
		.filters()
		.sort()
		.limitFields()
		.paginate()
		.populate();
	const admins = await features.query;
	return res.status(200).json({
		success: true,
		result: admins.length,
		data: { admins },
	});
});

export const getAdmin = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const { id: adminId, role } = req.decodedToken;
	if (id !== adminId && role !== 'admin') {
		return next(new HandleError('You do not have the permission', 401));
	}
	const admin = await Admin.findById(id).select('-password -__v');
	if (!admin) {
		return next(new HandleError(`Admin with ID ${id} not found.`, 404));
	}
	return res.status(200).json({
		success: true,
		data: { admin },
	});
});

export const updateAdmin = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const { nationalId = '', email = '', password = '', ...others } = req?.body;

	const updatedAdmin = await Admin.findByIdAndUpdate(id, others, {
		new: true,
		runValidators: true,
	}).select('-password -__v');
	if (!updatedAdmin) {
		return next(new HandleError(`User with ID ${id} not found.`, 404));
	}

	return res.status(200).json({
		success: true,
		message: `Admin with ID ${id} updated successfully by admin.`,
		data: {
			admin: {
				nationalId: updatedAdmin.nationalId,
				email: updatedAdmin.email,
				profileImage: updatedAdmin.profileImage,
				role: updatedAdmin.role,
			},
		},
	});
});

export const chengePasswordAdmin = catchAsync(async (req, res, next) => {
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

	const getAdmin = await Admin.findById(id);
	if (!getAdmin) {
		return next(new HandleError('Admin not found. Please try again.', 404));
	}

	if (!bcryptjs.compareSync(oldPass, getAdmin.password)) {
		return next(new HandleError('Wrong password.', 401));
	}

	if (oldPass == newPass) {
		return next(
			new HandleError('Same password. Can not chenge the password.', 401)
		);
	}

	const hashedPassword = bcryptjs.hashSync(newPass, 10);
	await Admin.findByIdAndUpdate(
		id,
		{ password: hashedPassword },
		{ new: true, runValidators: true }
	);

	return res.status(200).json({
		success: true,
		message: 'Password changed successfully.',
	});
});

export const createAdmin = catchAsync(async (req, res, next) => {
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

	const newAdmin = await Admin.create(req?.body);

	return res.status(201).json({
		success: true,
		message: 'Admin registered successfully.',
		data: {
			Admin: {
				nationalId: newAdmin.nationalId,
				email: newAdmin.email,
				profileImage: newAdmin.profileImage,
				role: newAdmin.role,
			},
		},
	});
});

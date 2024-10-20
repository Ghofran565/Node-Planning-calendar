import bcryptjs from 'bcryptjs';
import catchAsync from '../Utils/catchAsync.js';
import HandleError from '../Utils/handleError.js';
import ApiFeatures from '../Utils/apiFeatures.js';
import Admin from './../Models/adminMd';
import User from '../Models/userMd.js';

const passwordRegex = /(?=.*?[a-z])(?=.*?[0-9]).{8,}$/g;

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
		data: { admins },
	});
});

export const getAdmin = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const { id: adminId, role } = req.decodedToken;
	if (id !== adminId && role !== 'admin') {
		return next(new HandleError('You do not have the premission', 401));
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
	const updatedAdmin = await Admin.findByIdAndUpdate(id, req?.body, {
		new: true,
		runValidators: true,
	}).select('-password -__v');

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
	const { id: bodyId, oldPass, newPass } = req?.body;

	if (id !== bodyId) {
		return next(
			new HandleError('Unauthorized request. Admin ID mismatch.', 401)
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

	const getAdmin = await Admin.findById(id);
	if (!getAdmin) {
		return next(new HandleError('Admin not found. Please try again.', 404));
	}

	if (!bcryptjs.compareSync(oldPass, getAdmin.password)) {
		return next(new HandleError('Wrong password.', 401));
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
	const { nationalId, password, ...others } = req?.body;
	if (!passwordRegex.test(password)) {
		return next(
			new HandleError(
				'Password must be at least 8 characters long and contain at least one letter and one number.',
				400
			)
		);
	}

	const existingAdmin = await Admin.findOne({ nationalId });
	const existingUser = await User.findOne({ nationalId });
	if (existingAdmin || existingUser) {
		return next(new HandleError('nationalId is already registered.', 400));
	}

	const hashedPassword = bcryptjs.hashSync(password, 10);

	const newAdmin = await Admin.create({
		nationalId,
		password: hashedPassword,
		...others,
	});

	return res.status(201).json({
		success: true,
		message: 'Admin registered successfully.',
		data: {
			Admin: {
				nationalId: newAdmin.nationalId,
				email: newAdmin.email,
				profileImage: newAdmin.profileImage,
			},
		},
	});
});

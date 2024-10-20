import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import catchAsync from '../Utils/catchAsync.js';
import HandleError from '../Utils/handleError.js';
import { sendEmailCode, verifyEmailCode } from '../Utils/emailHandler.js';
import User from '../Models/userMd.js';
import Admin from './../Models/adminMd.js';

const nationalIdRegex = /^[0-9]{10}$/g;
const emailRegex = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/g;
const verificationCodeRegex = /\b\d{5}\b/g;
const passwordRegex = /(?=.*?[a-z])(?=.*?[0-9]).{8,}$/g;

const generateToken = (user, additionalPayload = {}) => {
	const payload = {
		id: user._id,
		email: user.email,
		role: user.role,
		...additionalPayload,
	};
	return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' });
};

export const auth = catchAsync(async (req, res, next) => {
	let person;
	const { nationalId, password } = req.body;
	if (!nationalIdRegex.test(nationalId)) {
		return next(new HandleError('Invalid NationalId format.', 400));
	}
	if (!passwordRegex.test(password)) {
		return next(new HandleError('Invalid Password.', 400));
	}

	const user = await User.findOne({ nationalId });
	const admin = await Admin.findOne({ nationalId });

	if (user) {
		person = user;
	} else if (admin) {
		person = admin;
	} else {
		return next(
			new HandleError('No users or admins found by this NationalId.', 404)
		);
	}

	if (!bcryptjs.compareSync(password, person.password)) {
		return next(new HandleError('Wrong password.', 401));
	}

	const token = generateToken(person);

	return res.status(200).json({
		success: true,
		data: {
			token,
		},
		message: 'logged in successfuly.',
	});
});

export const forgetPassword = catchAsync(async (req, res, next) => {
	let person;
	const { nationalId } = req?.body;

	if (!nationalIdRegex.test(nationalId)) {
		return next(new HandleError('Invalid NationalId format.', 400));
	}

	const user = await User.findOne({ nationalId });
	const admin = await Admin.findOne({ nationalId });

	if (user) {
		person = user;
	} else if (admin) {
		person = admin;
	} else {
		return next(
			new HandleError('No users or admins found by this NationalId.', 404)
		);
	}

	sendEmailCode(person.email);
	return res.status(200).json({
		success: true,
		message: `We have sent the code to ${person.email}.`,
	});
});

export const checkForgetPassword = catchAsync(async (req, res, next) => {
	let person;
	const { email, code } = req?.body;
	if (!emailRegex.test(email)) {
		return next(new HandleError('Invalid email format.', 400));
	}
	if (!verificationCodeRegex.test(code)) {
		return next(new HandleError('Invalid verification code format.', 400));
	}

	const user = await User.findOne({ email });
	const admin = await Admin.findOne({ email });

	if (user) {
		person = user;
	} else if (admin) {
		person = admin;
	} else {
		return next(
			new HandleError('No users or admins found by this Email.', 404)
		);
	}

	const verificationResult = verifyEmailCode(email, code);
	if (!verificationResult.authorized) {
		return next(new HandleError('Invalid verification code.', 401));
	}

	token = generateToken(person, {
		changePassword: true,
	});

	return res.status(200).json({
		success: true,
		data: { token },
		isCodeValidated: true,
		message: 'Verification code validated successfully.',
	});
});

export const changePassword = catchAsync(async (req, res, next) => {
	let person;
	const { id: bodyId, password } = req?.body;
	const { id, changePassword } = req.decodedToken;

	if (!changePassword) {
		return next(
			new HandleError('Unauthorized request to change password.', 401)
		);
	}

	if (id !== bodyId) {
		return next(
			new HandleError('Unauthorized request. User ID mismatch.', 401)
		);
	}

	if (!passwordRegex.test(password)) {
		return next(
			new HandleError(
				'Password must be at least 8 characters long and contain at least one letter and one number.',
				400
			)
		);
	}

	const hashedPassword = bcryptjs.hashSync(password, 10);

	const user = await User.findByIdAndUpdate(
		id,
		{ password: hashedPassword },
		{ new: true, runValidators: true }
	);

	const admin = await Admin.findByIdAndUpdate(
		id,
		{ password: hashedPassword },
		{ new: true, runValidators: true }
	);

	if (user) {
		person = user;
	} else if (admin) {
		person = admin;
	} else {
		return next(
			new HandleError('No users or admins found by this NationalId.', 404)
		);
	}


	const newToken = generateToken(person);

	return res.status(200).json({
		success: true,
		data: {
			token: newToken,
		},
		message: 'Password changed successfully.',
	});
});
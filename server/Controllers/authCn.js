import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import catchAsync from '../Utils/catchAsync.js';
import HandleError from '../Utils/handleError.js';
import { sendEmailCode, verifyEmailCode } from '../Utils/emailHandler.js';
import User from '../Models/userMd.js';

const nationalIdRegex = /^[0-9]{10}$/g;
const emailRegex = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/g;
const verificationCodeRegex = /\b\d{5}\b/g;
const passwordRegex = /(?=.*?[a-z])(?=.*?[0-9]).{8,}$/g;

const generateToken = (user, additionalPayload = {}) => {
	const payload = {
		id: user._id,
		email: user.email,
		...additionalPayload,
	};
	return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' });
};

export const auth = catchAsync(async (req, res, next) => {
	const { nationalId, password } = req.body;
	if (!nationalIdRegex.test(nationalId)) {
		return next(new HandleError('Invalid NationalId format.', 400));
	}
	if (!passwordRegex.test(password)) {
		return next(new HandleError('Invalid Password.', 400));
	}

	const user = await User.findOne({ nationalId });

	if (!user) {
		return next(new HandleError('No users found by this NationalId.', 400));
	} else if (!bcryptjs.compareSync(password, user.password)) {
		return next(
			new HandleError('Wrong password. Please try again.', 401)
		);
	}

	const token = generateToken(user);

	return res.status(200).json({
		success: true,
		data: {
			token,
		},
		message: 'logged in successfuly.',
	});
});

export const forgetPassword = catchAsync(async (req, res, next) => {
	const { nationalId } = req?.body;
	if (!nationalIdRegex.test(nationalId)) {
		return next(new HandleError('Invalid NationalId format.', 400));
	}
	const user = await User.findOne({ nationalId });
	if (!user) {
		return next(new HandleError('No users found by this NationalId.', 404));
	}
	sendEmailCode(user.email);
	return res.status(200).json({
		success: true,
		message: `We have sent the code to ${user.email}.`,
	});
});

export const checkForgetPassword = catchAsync(async (req, res, next) => {
	const { email, code } = req?.body;
	if (!emailRegex.test(email)) {
		return next(new HandleError('Invalid email format.', 400));
	}
	if (!verificationCodeRegex.test(code)) {
		return next(new HandleError('Invalid verification code format.', 400));
	}
	const user = await User.findOne({ email });
	if (!user) {
		return next(new HandleError('User not found. Please sign up first.', 404));
	}
	const verificationResult = verifyEmailCode(email, code);
	if (!verificationResult.authorized) {
		return next(new HandleError('Invalid verification code.', 401));
	}
	const token = generateToken(user, { changePassword: true });
	return res.status(200).json({
		success: true,
		data: { token },
		isCodeValidated: true,
		message: 'Verification code validated successfully.',
	});
});

export const changePassword = catchAsync(async (req, res, next) => {
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

	if (!user) {
		return next(new HandleError('User not found. Please try again.', 404));
	}

	const newToken = generateToken(user);

	return res.status(200).json({
		success: true,
		data: {
			token: newToken,
		},
		message: 'Password changed successfully.',
	});
});


//TODO User auth and admin aurh are diffrent

import jwt from 'jsonwebtoken';
import HandleError from '../Utils/handleError.js';
import catchAsync from '../Utils/catchAsync.js';

const isLogin = catchAsync(async (req, res, next) => {
	let token;
	let decoded;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	}

	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET);
	} catch (error) {
		decoded = false;
	}

	if (!decoded) {
		return next(
			new HandleError('Authentication required. Please log in.', 401)
		);
	}

	req.decodedToken = decoded;
	return next();
});

export default isLogin;

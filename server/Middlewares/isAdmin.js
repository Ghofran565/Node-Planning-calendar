import jwt from 'jsonwebtoken';
import catchAsync from '../Utils/catchAsync.js';
import HandleError from '../Utils/handleError.js';

const isAdmin = (allowedRoles) =>
	catchAsync(async (req, res, next) => {
		let token;
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith('Bearer')
		) {
			token = req.headers.authorization.split(' ')[1];
		}

		if (!token) {
			return next(
				new HandleError(
					"Oops! No token found. Please send a token so we can verify if you're logged in.",
					401
				)
			);
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const { role } = decoded;

		//* If superAdmin is allowed, admin should automatically be allowed too
		if (allowedRoles.includes('superAdmin')) {
			allowedRoles.push('admin');
		}

		if (!allowedRoles.includes(role)) {
			return next(
				new HandleError(
					`Access denied. This action is reserved for roles: ${allowedRoles.join(', ')}.`,
					403
				)
			);
		}

		req.decodedToken = decoded;
		return next();
	});

export default isAdmin;

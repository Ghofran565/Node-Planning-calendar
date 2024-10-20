import jwt from 'jsonwebtoken';
import catchAsync from '../Utils/catchAsync.js';
import HandleError from '../Utils/handleError.js';

const isAdmin = (allowedRoles) =>
	catchAsync(async (req, res, next) => {
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

		const { role } = decoded;

		if (role !== 'admin') {
			return next(
				new HandleError(
					'Access denied. This action is reserved for admin only',
					403
				)
			);
		}

		req.decodedToken = decoded;
		return next();
	});

export default isAdmin;

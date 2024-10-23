import jwt from 'jsonwebtoken';
import HandleError from '../Utils/handleError.js';
import catchAsync from '../Utils/catchAsync.js';

const uploadLog = [];
const dailyUploadLimit = 5;
let dayResetTime = new Date().getDay();

function addUploadToLog(id) {
	const currentDay = new Date().getDay();
	if (currentDay != dayResetTime) {
		dayResetTime = currentDay;
		uploadLog = [];
	}

	const existingUpload = uploadLog.find((upload) => upload.id === id);

	if (existingUpload) {
		if (existingUpload.times >= dailyUploadLimit) {
			return true;
		} else {
			existingUpload.times++;
		}
	} else {
		uploadLog.push({ id, times: 1 });
	}
}

const checkUpload = catchAsync(async (req, res, next) => {
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

	const { id } = decoded;

	const log = addUploadToLog(id);
	if (log) {
		return next(
			new HandleError(
				'Access denied. You have exceeded your daily upload limit.',
				403
			)
		);
	}

	req.decodedToken = decoded;
	return next();
});

export default checkUpload;

import Admin from '../Models/adminMd.js';
import Reports from '../Models/reportsMd.js';
import ApiFeatures from '../Utils/apiFeatures.js';
import catchAsync from '../Utils/catchAsync.js';
import HandleError from '../Utils/handleError.js';

export const getAllReports = catchAsync(async (req, res, next) => {
	const { id: userId, role } = req.decodedToken;
	let data;

	if (role === 'supporter' || role === 'parent') {
		const admin = await Admin.findById(userId);
		const studentIds = admin.studentsIds;
		req.query = { userId: { $in: studentIds } }; //! prob 
		const features = new ApiFeatures(Reports, req.query)
			.filters()
			.sort()
			.limitFields()
			.paginate()
			.populate()
			data = await features.query;
			console.log("first admin")
	} else if (role === 'admin') {
		const features = new ApiFeatures(Reports, req.query)
			.filters()
			.sort()
			.limitFields()
			.paginate()
			.populate()

			data = await features.query;
			console.log("else admin")
	} else {
		data = await Reports.findOne({ userId: userId })
		console.log("else")
	}

	return res.status(200).json({
		success: true,
		result: data.length,
		data: { data },
	});
});

export const getIdReports = catchAsync(async (req, res, next) => {
	let data;
	const { id } = req.params;
	const { id: userId, role } = req.decodedToken;

	if (role === undefined) {
		data = await Reports.findOne({ userId: userId })
			.select('-__v')
			.populate('*');
	} else {
		const admin = await Admin.findById(userId);
		const studentIds = admin.studentsIds;
		if (studentIds.includes(id) || role === 'admin') {
			data = await Reports.findOne({ userId: id }).select('-__v').populate('*');
		} else {
			return next(new HandleError('You do not have the permission', 401));
		}
	}

	return res.status(200).json({
		success: true,
		result: data.length,
		data: { data },
	});
});

export const createRecord = catchAsync(async (req, res, next) => {
	const { id: userId, role } = req.decodedToken;
	const { parentComment, supporterComment, isConfirmed, ...others } = req?.body;

console.log(req.decodedToken)
console.log(req.decodedToken.role)

	if (role !== undefined) {
		return next(new HandleError('You do not have the permission', 401));
	}

	const report = await Reports.findOne({ userId: userId }).populate('*');

console.log(report)

	const admin = await Admin.findOne({
		studentsIds: { $in: userId },
		role: 'parent',
	}).populate('*');

	console.log(admin)
	console.log(admin.isConfirming)

	if (admin.isConfirming) {
		report.records.push(...others);
	} else {
		report.records.push({ isConfirmed: true, ...others });
	}

	const savedReport = await report.save();

	return res.status(201).json({
		success: true,
		message: "Today's report registered successfully.",
		data: {
			record: {
				date: savedReport.records.date,
				records: savedReport.records.record,
			},
		},
	});
});

export const confirmRecord = catchAsync(async (req, res, next) => {
	let updatedReport;
	const { id, sId } = req.params;
	const { id: userId, role } = req.decodedToken;

	if (!role === 'parent') {
		return next(new HandleError('You do not have the permission', 401));
	}

	const admin = await Admin.findById(userId);
	const studentIds = admin.studentsIds;

	if (studentIds.includes(sId)) {
		const report = await Reports.findOne({ userId: sId }).populate('*');
		if (!report) {
			return next(new HandleError('No reports found from the student id', 404));
		}
		if (report.records.findIndex((record) => record._id === id)) {
			updatedReport = await Reports.records
				.findByIdAndUpdate(id, { isConfirmed: true })
				.select('-__v')
				.populate('*');
		} else {
			return next(new HandleError('Id mismatch, no permission', 401));
		}
		if (!updatedReport) {
			new HandleError('There was a problem in confirming record.', 500);
		}
	} else {
		return next(new HandleError('You do not have the permission', 401));
	}

	return res.status(200).json({
		success: true,
		message: 'This record confirmed successfully',
		data: {
			record: {
				date: updatedReport.date,
				confirm: updatedReport.isConfirmed,
			},
		},
	});
});

export const registerComment = catchAsync(async (req, res, next) => {
	let updatedReport;
	const { id, sId } = req.params;
	const { id: userId, role } = req.decodedToken;
	const { comment } = req?.body;

	if (role === 'admin') {
		return next(new HandleError('You do not have the permission', 401));
	}
	const admin = await Admin.findById(userId);
	const studentIds = admin.studentsIds;

	if (role == undefined) {
		const report = await Reports.findOne({ userId: userId }).populate('*');
		if (!report.records.findIndex((record) => record._id === id)) {
			return next(new HandleError('You do not have the permission', 401));
		}

		updatedReport = await Reports.records
			.findByIdAndUpdate(id, { studentComment: comment })
			.select('-__v')
			.populate('*');
		if (!updatedReport) {
			new HandleError(
				'There was a problem in update query, no returns recived',
				500
			);
		}
	} else if (studentIds.includes(sId)) {
		const report = await Reports.findOne({ userId: sId }).populate('*');
		if (!report) {
			return next(new HandleError('No reports found from the student id', 404));
		}
		if (role === 'supporter') {
			if (report.records.findIndex((record) => record._id === id)) {
				updatedReport = await Reports.records
					.findByIdAndUpdate(id, { supporterComment: comment })
					.select('-__v')
					.populate('*');
			} else {
				return next(new HandleError('Id mismatch, no permission', 401));
			}
			if (!updatedReport) {
				new HandleError(
					'There was a problem in update query, no returns recived.',
					500
				);
			}
		} else {
			//there is just 1 chance and that is parent
			if (report.records.findIndex((record) => record._id === id)) {
				updatedReport = await Reports.records
					.findByIdAndUpdate(id, { parentComment: comment })
					.select('-__v')
					.populate('*');
			} else {
				return next(new HandleError('Id mismatch, no permission', 401));
			}
			if (!updatedReport) {
				new HandleError(
					'There was a problem in update query, no returns recived.',
					500
				);
			}
		}
	} else {
		return next(new HandleError('You do not have the permission', 401));
	}

	return res.status(201).json({
		success: true,
		message: `Your comment Updated as ${
			role == undefined ? 'student' : role
		} successfully.`,
		data: {
			record: {
				date: updatedReport.records.date,
				comment: updatedReport.records.parentComment,
			},
		},
	});
});

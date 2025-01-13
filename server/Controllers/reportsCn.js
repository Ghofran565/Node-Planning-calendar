import Admin from '../Models/adminMd.js';
import Reports from '../Models/reportsMd.js';
import ApiFeatures from '../Utils/apiFeatures.js';
import catchAsync from '../Utils/catchAsync.js';
import HandleError from '../Utils/handleError.js';

function compareDates(date1, date2) {
	const parsedDate1 = new Date(date1);
	const parsedDate2 = new Date(date2);

	return (
		parsedDate1.toISOString().split('T')[0] ===
		parsedDate2.toISOString().split('T')[0]
	);
}

export const getAllReports = catchAsync(async (req, res, next) => {
	const { id: userId, role } = req.decodedToken;
	let data;
	let initialQuery = {};

	if (role == 'supporter' || role == 'parent') {
		const admin = await Admin.findById(userId);
		const studentIds = admin.studentsIds;
		initialQuery = { userId: { $in: studentIds } };
	} else if (role === 'admin') {
		initialQuery = req.query;
	} else {
		initialQuery = { userId: userId };
	}

	const features = new ApiFeatures(Reports, req.query, initialQuery)
		.filters()
		.sort()
		.limitFields()
		.paginate()
		.populate();

	data = await features.query;

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
		data = await Reports.findOne({ userId: userId }).select('-__v');
	} else {
		const admin = await Admin.findById(userId);
		const studentsIds = admin.studentsIds;
		if (!studentsIds[0]) {
			return next(
				new HandleError('Sorry, but no students were registered for you', 400)
			);
		} else {
			data = await Reports.findById(id);
		}
		if (!studentsIds.includes(data.userId) && !role === 'admin') {
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
	let recordExists = false;

	const { id: userId, role } = req.decodedToken;
	const { parentComment, supporterComment, isConfirmed, ...others } = req?.body;

	if (role !== undefined) {
		return next(new HandleError('You do not have the permission', 401));
	}

	const report = await Reports.findOne({ userId: userId });

	const admin = await Admin.findOne({
		studentsIds: { $in: userId },
		role: 'parent',
	});

	for (let i = 0; i < report.records.length; i++) {
		if (compareDates(report.records[i].date, others.date)) {
			report.records[i] = others;
			recordExists = true;
			break;
		}
	}
	if (!recordExists) {
		if (admin) {
			if (!admin.isConfirming) {
				report.records.push({ ...others, isConfirmed: true });
			}
		} else {
			report.records.push(others);
		}
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
	let record;
	const { id, sId } = req.params;
	const { id: userId, role } = req.decodedToken;

	if (!role == 'parent') {
		return next(new HandleError('You do not have the permission', 401));
	}

	const admin = await Admin.findById(userId);
	if (!admin) {
		return next(
			new HandleError(
				'There was a problem finding your information by your ID.',
				401
			)
		);
	}
	const studentIds = admin.studentsIds;

	if (studentIds.includes(sId)) {
		const report = await Reports.findOne({ userId: sId });
		if (!report) {
			return next(
				new HandleError('No reports found from this student id', 404)
			);
		}
		if (report.records.findIndex((record) => record._id === id)) {
			record = report.records.id(id);

			if (!record) {
				return next(new HandleError('Id mismatch, no permission', 401));
			}

			record.isConfirmed = true;

			updatedReport = await report.save();
		}
		if (!updatedReport) {
			return next(
				new HandleError('There was a problem in confirming record.', 500)
			);
		}
	} else {
		return next(new HandleError('You do not have the permission', 401));
	}

	return res.status(200).json({
		success: true,
		message: 'This record was confirmed successfully',
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
	let studentIds
	const { id, sId } = req.params;
	const { id: userId, role } = req.decodedToken;
	const { comment } = req?.body;

	if (role === 'admin') {
		 return next(new HandleError('You do not have the permission', 401));
	}
	const admin = await Admin.findById(userId);
	if(admin){
		 studentIds = admin.studentsIds;
		
	}

	if (role == undefined) {
		 const report = await Reports.findOne({ userId: userId });
		 if (!report) {
			  return next(new HandleError('No reports found for this user id', 404));
		 }
		 const record = report.records.id(id);
		 if (!record) {
			  return next(new HandleError('You do not have the permission', 401));
		 }

		 record.studentComment = comment;
		 updatedReport = await report.save();
		 if (!updatedReport) {
			  return next(new HandleError('There was a problem in update query, no returns received', 500));
		 }
	} else if (studentIds.includes(sId)) {
		 const report = await Reports.findOne({ userId: sId });
		 if (!report) {
			  return next(new HandleError('No reports found from the student id', 404));
		 }
		 const record = report.records.id(id);
		 if (!record) {
			  return next(new HandleError('Id mismatch, no permission', 401));
		 }
		 if (role === 'supporter') {
			  record.supporterComment = comment;
		 } else {
			  // there is just 1 chance and that is parent
			  record.parentComment = comment;
		 }
		 updatedReport = await report.save();
		 if (!updatedReport) {
			  return next(new HandleError('There was a problem in update query, no returns received.', 500));
		 }
	} else {
		 return next(new HandleError('You do not have the permission', 401));
	}

	return res.status(201).json({
		 success: true,
		 message: `Your comment Updated as ${role == undefined ? 'student' : role} successfully.`,
		 data: {
			  record: {
					date: updatedReport.records.id(id).date,
					comment: role === 'supporter' ? updatedReport.records.id(id).supporterComment : updatedReport.records.id(id).parentComment,
			  },
		 },
	});
});

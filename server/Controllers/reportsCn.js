import Admin from '../Models/adminMd.js';
import Reports from '../Models/reportsMd.js';
import ApiFeatures from '../Utils/apiFeatures.js';
import catchAsync from '../Utils/catchAsync.js';
import HandleError from '../Utils/handleError.js';

export const getAllReports = catchAsync(async (req, res, next) => {
	const { id: userId, role } = req.decodedToken;

	if (role === 'supporter' || role === 'parent') {
		const admin = await Admin.findById(userId);
		const studentIds = admin.studentsIds;

		const features = new ApiFeatures(Reports, req.query)
			.filters({ userId: { $in: studentIds } })
			.sort()
			.limitFields()
			.paginate()
			.populate('*')
			.select('-__v');
		data = await features.query;
	} else if (role === 'admin') {
		const features = new ApiFeatures(Reports, req.query)
			.filters()
			.sort()
			.limitFields()
			.paginate()
			.populate('*')
			.select('-__v');
		data = await features.query;
	} else {
		data = await Reports.findOne({ userId: userId })
			.populate('*')
			.select('-__v');
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
			return next(new HandleError('You do not have the premission', 401));
		}
	}

	return res.status(200).json({
		success: true,
		result: data.length,
		data: { data },
	});
});

export const createRecord = catchAsync(async (req, res, next) => {
	const { id: userId } = req.decodedToken;
	const { parentComment, supporterComment, isConfirmed, ...others } = req?.body;

	if (!role === undefined) {
		return next(new HandleError('You do not have the premission', 401));
	}

	const report = await Reports.findOne({ userId: userId }).populate('*');

	const admin = await Admin.findOne({
		studentsIds: { $in: userId },
		role: 'parent',
	}).populate('*');

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
	// let updatedReport;
	// const { id } = req.params;
	// const { id: userId, role } = req.decodedToken;

	// if (!role === 'parent' && !role === 'admin') {
	// 	return next(new HandleError('You do not have the premission', 401));
	// }

	// const admin = await Admin.findById(userId);
	// const studentIds = admin.studentsIds;
	// if (studentIds.includes(id) || role === 'admin') { //big problem in ID
	// 	updatedReport = await Reports.records
	// 		.findByIdAndUpdate(id, { isConfirmed: true })
	// 		.select('-__v')
	// 		.populate('*');
	// 	if (!updatedReport) {
	// 		new HandleError('No reports found by this id.', 404);
	// 	}
	// } else {
	// 	return next(new HandleError('You do not have the premission', 401));
	// }

	// return res.status(200).json({
	// 	success: true,
	// 	message: 'This record confirmed successfully',
	// 	data: {
	// 		record: {
	// 			date: updatedReport.date,
	// 			confirm: updatedReport.isConfirmed,
	// 		},
	// 	},
	// });

	return res.status(200).json({
		success: false,
		message: 'This controllers is under coding',
	});
});
//TODO not complected confirmRecord

export const registerComment = catchAsync(async (req, res, next) => {
   // let updatedReport
	// const { id } = req.params;
	// const { id: userId, role } = req.decodedToken;
	// const { comment } = req?.body;

	// if (role === 'admin') {
	// 	return next(new HandleError('You do not have the premission', 401));
	// }
	// const admin = await Admin.findById(userId);
   // const studentIds = admin.studentsIds;

	// if (role == undefined) {
	// 	const report = await Reports.findOne({ userId: userId }).populate('*');
	// 	if (!report.records['_id'] == id) {
	// 		return next(new HandleError('You do not have the premission', 401));
	// 	}

	// 	updatedReport = await Reports.records
	// 		.findByIdAndUpdate(id, {studentComment: comment})
	// 		.select('-__v')
	// 		.populate('*');
	// 	if (!updatedReport) {
	// 		new HandleError('There was a problem in update query, no returns recived', 404);
	// 	}
	// } else if (studentIds.includes(id)) { //!conT
   //    const report = await Reports.findOne({ userId: userId }).populate('*');
	// 	if (!report.records['_id'] == id) {
	// 		return next(new HandleError('You do not have the premission', 401));
	// 	}

	// 	updatedReport = await Reports.records
	// 		.findByIdAndUpdate(id, {studentComment: comment})
	// 		.select('-__v')
	// 		.populate('*');
	// 	if (!updatedReport) {
	// 		new HandleError('There was a problem in update query, no returns recived', 404);
	// 	}
	// }
   
   // // return next(new HandleError('You do not have the premission', 401));
	// const updatedReports = await Reports.records.findByIdAndUpdate();


	// return res.status(201).json({
	// 	success: true,
	// 	message: "Today's report registered successfully.",
	// 	data: {
	// 		record: {
	// 			date: savedReport.records.date,
	// 			records: savedReport.records.record,
	// 		},
	// 	},
	// });

   return res.status(200).json({
		success: false,
		message: 'This controllers is under coding',
	});
});
//TODO not complected registerComment
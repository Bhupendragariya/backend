import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import Employee from "../models/employee.model.js";
import Leave from "../models/leave.model.js";
import User from "../models/user.model.js";
import { generateAccessAndRefreshTokens } from "../util/jwtToken.js";
import { nanoid } from "nanoid";
import { sendNotification } from "../util/notification.js";
import cloudinary from "../config/cloudinary.js";
import Document, { DOCUMENT_TYPE_ENUM } from "../models/document.model.js";
import Feedback from "../models/feedback.model.js";
import Meeting from "../models/meeting.model.js";
import Salary from "../models/salary.model.js";
import BankAccount from "../models/banckAccount.model.js";
import Department from "../models/department.model.js";
import Position from "../models/position.model.js";
import MeetingType from "../models/meetingType.model.js";
import EmpIdConfig from "../models/empIdConfig.model.js";
import ReviewCycleConfig from "../models/reviewCycleConfig.model.js";
import TaskScoreConfig from "../models/taskScoreConfig.model.js";
import PerfMetricsConfig from "../models/perfMetricsConfig.model.js";
import StandardWorkingHour from "../models/standardWorkingHour.model.js";
import { populate } from "dotenv";
import Performance from "../models/performance.model.js";
import Payslip from "../models/payslip.model.js";
import Settings from "../models/setting.model.js";
import Attendance from "../models/attendance.model.js";
import jwt from "jsonwebtoken";




export const refreshAccessToken = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return next(new ErrorHandler("Refresh token missing", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return next(new ErrorHandler("Invalid or expired refresh token", 401));
  }


  
  const user = await User.findById(decoded.id).select("+refreshToken");

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }


  if (user.refreshToken !== token) {
    return next(new ErrorHandler("Refresh token mismatch", 402));
  };

   console.log("mis mach", token);
    console.log("mis mach", user.refreshToken);


 const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user.id);




  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    sameSite: "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });

  res.status(200).json({
    message: "Access token refreshed",
    accessToken,
    user
  });
});




//------auth related controllers------//



export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;

  try {
    if (!email || !password || !role) {
      return next(
        new ErrorHandler("Please provide name, email, password and role", 400)
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(new ErrorHandler("User already exists with this email", 400));
    }

    const user = await User.create({
      email,
      password,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;

  try {
    if (!email || !password || !role) {
      return next(new ErrorHandler("please provide email and password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHandler(" Invalid user and password ", 400));
    }
    

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return next(new ErrorHandler(" Invalid user and password ", 400));
    }

    if (user.role !== role) {
      return next(new ErrorHandler("Unauthorized role", 403));
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );
   

    user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: "Login successfully",
      accessToken,
      user,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});



//------documents related controllers------//
export const approveOrRejectUpdateRequest = catchAsyncErrors(async (req, res, next) => {
  const { docId } = req.params;
  const { action } = req.body; //action=approve/reject

  if (!['approve', 'reject'].includes(action)) {
    return next(new ErrorHandler("Invalid action. Must be either 'approve' or 'reject'", 400));
  }

  const document = await Document.findById(docId);
  if (!document || document.status !== 'pending-update') {
    return next(new ErrorHandler("No pending update request found", 404));
  }

  const requestedChanges = document.requestedChanges;

  if (action === 'approve') {
    // Delete old Cloudinary file
    if (document.publicId) {
      await cloudinary.uploader.destroy(document.publicId);
    }

    // Apply requested changes
    document.type = requestedChanges.type;
    document.fileUrl = requestedChanges.fileUrl;
    document.publicId = requestedChanges.publicId;
    document.fileMimeType = requestedChanges.fileMimeType;
    document.status = 'approved';
    document.reasonForRequest = '';
    document.requestedChanges = undefined;

    await document.save();

    // await sendNotification({
    //   userId: document.user.id,
    //   title: "Your Document Request",
    //   message: `Your document request was submitted successfully with status: ${document.status}.`,
    //   type: "document",
    //   createdBy: req.user.id,
    // });

    return res.status(200).json({
      success: true,
      message: "Document update request approved",
      document
    })
  }

  //if action === 'reject'
  //delele new req file from cloudinary
  if (requestedChanges.publicId) {
    await cloudinary.uploader.destroy(requestedChanges.publicId)
  }

  document.status = 'rejected'
  document.reasonForRequest = '';
  document.requestedChanges = undefined;

  await document.save();

  return res.status(200).json({
    success: true,
    message: "Document update request rejected",
    document,
  })
})

export const approveOrRejectDeleteRequest = catchAsyncErrors(async (req, res, next) => {
  const { docId } = req.params;
  const { action } = req.body;

  if (!['approve', 'reject'].includes(action)) {
    return next(new ErrorHandler("Invalid action. Must be either 'approve' or 'reject'", 400));
  }

  const document = await Document.findById(docId);
  if (!document || document.status !== 'pending-delete') {
    return next(new ErrorHandler("No pending delete request found", 404));
  }

  if (action === 'approve') {
    // Delete doc from Cloudinary
    if (document.publicId) {
      await cloudinary.uploader.destroy(document.publicId);
    }

    // Remove from employee data
    await Employee.findOneAndUpdate(
      { user: document.user },
      { $pull: { documents: docId } }
    )

    // Remove doc from doc data
    await Document.findByIdAndDelete(docId);

    return res.status(200).json({
      success: true,
      message: "Document delete request approved"
    })
  }

  //if action === 'reject'
  document.status = 'approved';
  document.reasonForRequest = '';
  await document.save();

  return res.status(200).json({
    success: true,
    message: "Document delete request rejected",
    document
  });

})




//------message related controllers------//


export const getInboxMessages = async (req, res) => {
  try {
    const inbox = await Message.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.status(200).json({ messages: inbox });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
};



//------feedback related controllers------//


export const markFeedbackAsRead = catchAsyncErrors(async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ error: 'Feedback not found' });

    feedback.status = 'read';
    await feedback.save();

    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const getUnreadFeedbackCount = catchAsyncErrors(async (req, res, next) => {
  try {
    const unreadCount = await Feedback.countDocuments({ status: 'unread' });
    res.status(200).json({
      success: true,
      unread: unreadCount,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const getAllFeedbackMessages = catchAsyncErrors(async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'name email')
      .populate('user', ' email') 
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      feedbacks,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});




//------meeting related controllers------//


export const createMeeting = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, type, date, time, description } = req.body;

    if (!name || !type || !date || !time) {
      return next(new ErrorHandler("Missing required fields", 400));
    }

    const [startTime, endTime] = time.split(' - ').map(t => t.trim());
    const [dd, mm, yy] = date.split('-');
    const formattedDate = new Date(`20${yy}-${mm}-${dd}`);


    const users = await User.find({ role: { $in: ['employee'] } });

    const attendeeIds = users.map(user => user._id);

    const existingType = await MeetingType.findOne({ name: type });
    if (!existingType) {
      return next(new ErrorHandler("Meeting type does not exist", 400));
    }

    const meeting = await Meeting.create({
      name,
      type: existingType._id,
      date: formattedDate,
      startTime,
      endTime,
      description,
      createdBy: req.user.id,
      attendees: attendeeIds
    });

    const notifications = attendeeIds.map(userId => ({
      user: userId,
      title: `New ${type}: ${name}`,
      description: `Scheduled on ${date} at ${startTime}`,
      type: 'meeting',
      createdBy: req.user.id
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: 'Meeting created and all users notified.',
      meeting,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const getUserMeetings = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  try {


    const meetings = await Meeting.find({ attendees: userId })
      .sort({ date: 1 })
      .limit(50);

    res.status(200).json({
      success: true,
      meetings
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const addMeetingType = catchAsyncErrors(async (req, res, next) => {
  const loggedInUserId = req.user.id

  const { name } = req.body;
  if (!name) {
    return next(new ErrorHandler("Meeting Type name is required", 400));
  }

  const existingMeetingType = await MeetingType.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
  if (existingMeetingType) {
    return next(new ErrorHandler("Meeting Type already exists", 400));
  }

  const meetingType = await MeetingType.create({
    name,
    createdBy: loggedInUserId
  });

  res.status(201).json({
    success: true,
    message: "Meeting Type added successfully",
    meetingType
  });
})

export const deleteMeetingType = catchAsyncErrors(async (req, res, next) => {
  const { typeId } = req.params;
  if (!typeId) {
    return next(new ErrorHandler("Meeting Type ID is required", 400));
  }

  const meetingType = await MeetingType.findById(typeId);
  if (!meetingType) {
    return next(new ErrorHandler("Meeting Type not found", 404));
  }

  // Remove meeting type from meetings and set to null
  await Meeting.updateMany(
    { type: typeId },
    { $set: { type: null } }
  );

  await MeetingType.findByIdAndDelete(typeId);

  res.status(200).json({
    success: true,
    message: "Meeting Type deleted successfully and all meetings' types set to null"
  });
})

export const getAllMeetingTypes = catchAsyncErrors(async (req, res, next) => {
  const meetingTypes = await MeetingType.find()

  res.status(200).json({
    success: true,
    meetingTypes
  });
})




export const createLeaveByAdmin = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    leaveType,
    startDate,
    endDate,
    reason,
    comment
  } = req.body;
  try {

    if (!name || !leaveType || !startDate || !endDate || !reason) {
      return next(new ErrorHandler("Please fill all required fields", 400));
    }


    const employee = await Employee.findOne({ name });
    if (!employee) {
      return next(new ErrorHandler("Employee not found", 404));
    }


    const toDate = (dateStr) => {
      const [dd, mm, yy] = dateStr.split("-");
      return new Date(`20${yy}-${mm}-${dd}`);
    };

    const leave = await Leave.create({
      user: name,
      leaveType,
      startDate: toDate(startDate),
      endDate: toDate(endDate),
      reason,
      comment,
      createdAt: new Date(),
      reviewedBy: null,
      reviewedAt: null,
      status: "Pending"
    });

    res.status(201).json({
      success: true,
      message: "Leave request submitted by Admin/HR.",
      leave
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});



//------performance related controllers------//


export const getAllEmployeePerformanceEvaluations = catchAsyncErrors(async (req, res, next) => {
  try {

    const employees = await Employee.find();


    const results = await Promise.all(
      employees.map(async (emp) => {
        const evaluation = await PerformanceEvaluation.findOne({ employee: emp._id })
          .sort({ updatedAt: -1 })
          .lean();

        return {
          employeeName: emp.fullName,
          position: emp.position,
          performanceScore: evaluation ? evaluation.performanceScore : null,
          scores: evaluation ? evaluation.scores : null,
          notes: evaluation ? evaluation.notes : null,
          lastUpdated: evaluation ? evaluation.updatedAt : null,
          employeeId: emp._id,
        };
      })
    );

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});





export const saveEvaluation =  catchAsyncErrors( async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const evaluatorId = req.user.id; 
    const { workQuality, productivity, reliability, teamwork, innovation, notes } = req.body;

    const performanceScore = (
      (workQuality + productivity + reliability + teamwork + innovation) / 5
    ).toFixed(2);

   
    let evaluation = await PerformanceEvaluation.findOne({ employee: employeeId,  });

    if (evaluation) {
     
      evaluation.scores = { workQuality, productivity, reliability, teamwork, innovation };
      evaluation.notes = notes;
      evaluation.performanceScore = performanceScore;
      await evaluation.save();
    } else {
  
      evaluation = await PerformanceEvaluation.create({
        employee: employeeId,
        evaluator: evaluatorId,
        scores: { workQuality, productivity, reliability, teamwork, innovation },
        notes,
        performanceScore,
      });
    }

    res.status(200).json({ success: true, evaluation });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400)); 
  }
});





export const reviewPerformance = catchAsyncErrors(async (req, res, next) => {
  const { empId } = req.params;
  const loggedInUserId = req.user.id
  const { scores, notes } = req.body; //scores=[{metricName, score}]

  const employee = await Employee.findById(empId);
  if (!employee) {
    return next(new ErrorHandler("Employee not found", 404));
  }

  const evaluator = await User.findById(loggedInUserId);
  if (!evaluator || (evaluator.role !== 'admin' && evaluator.role !== 'hr')) {
    return next(new ErrorHandler("You are not authorize to add performance review.Only Admin or HR can do that", 403));
  }

  if (!scores || !Array.isArray(scores) || scores.length === 0) {
    return next(new ErrorHandler("Scores are required and should be an non-empty array", 400));
  }

  const taskScoreConfig = await TaskScoreConfig.findOne();
  if (!taskScoreConfig) {
    return next(new ErrorHandler("Task Score Config not found", 404));
  }

  const sumOfScores = scores.reduce((acc, scoreObj) => acc + scoreObj.score, 0) //3+4+5=12
  const totalOfMaxScore = scores.length * taskScoreConfig.maxScore //3*5=15
  const percentageScore = (sumOfScores / totalOfMaxScore) * 100;// (12/15)*100=80
  const averageScore = sumOfScores / scores.length; //12/3=4

  const performanceScore = {
    sumOfScores,
    totalOfMaxScore,
    averageScore,
    percentageScore
  }

  let performanceReview = await Performance.findOne({ employee: empId })

  if (performanceReview) {
    performanceReview.evaluator = evaluator._id;
    performanceReview.scores = scores;
    performanceReview.notes = notes ?? performanceReview.notes;
    performanceReview.performanceScore = performanceScore
    await performanceReview.save();
  } else {
    performanceReview = await Performance.create({
      employee: empId,
      evaluator: evaluator._id,
      scores,
      notes,
      performanceScore
    })
  }

  res.status(201).json({
    success: true,
    message: "Performance review submitted successfully",
    minScorePerTask: taskScoreConfig.minScore,
    maxScorePerTask: taskScoreConfig.maxScore,
    performanceReview
  })
})

export const getEmployeePerformance = catchAsyncErrors(async (req, res, next) => {
  const { empId } = req.params;

  const employee = await Employee.findById(empId);
  if (!employee) {
    return next(new ErrorHandler("Employee not found", 404));
  }

  const performanceReview = await Performance.findOne({ employee: empId })
  if (!performanceReview) {
    return next(new ErrorHandler("Performance review not found", 404));
  }

  res.status(201).json({
    success: true,
    employee,
    performanceReview
  })
})

export const getAllEmployeePerformance = catchAsyncErrors(async (req, res, next) => {
  const performances = await Performance.find()
    // .populate('employee', 'fullName employeeId department position documents')
    // .populate("employee.department", "name")
    // .populate("employee.position", "name")
    // .populate({path:'employee.documents',match:{type:'empPhoto'}, select:'fileUrl publicId fileMimeType'})    
    .populate({
      path: 'employee',
      select: 'fullName employeeId department position',
      populate: [
        { path: 'department', select: 'name' },
        { path: 'position', select: 'name' },
        { path: 'documents', match: { type: 'empPhoto' }, select: 'type fileUrl publicId fileMimeType' }
      ]
    })

  if (!performances || performances.length === 0) {
    return next(new ErrorHandler("No performance reviews found", 404));
  }

  res.status(200).json({
    success: true,
    performances
  })
});


//------employee related controllers------//
//------add employee related controllers------//



export const addEmployee = catchAsyncErrors(async (req, res, next) => {
  const {
    fullName, fatherName, employeeId, email, contactNo, emgContactName, emgContactNo, joinedOn, department, position, currentAddress, permanentAddress, bio,
    //bank details
    bankName, accountNumber, ifscCode,
    //salary details
    basic, salaryCycle, allowances, deductions, netSalary
  } = req.body

  
  console.log({
  fullName, email, contactNo, emgContactName, emergencyContact,
  joiningDate, department, position, address, permanentAddress,
  bankName, accountNumber, ifscCode,
  basic, salaryCycle, allowances, netSalary
});
  //bio and deductions are optional
  if (
    !fullName || !fatherName || !email || !contactNo || !emgContactName || !emgContactNo ||
    !joinedOn || !department || !position || !currentAddress || !permanentAddress ||
    !bankName || !accountNumber || !ifscCode ||
    !basic || !salaryCycle || !allowances || !netSalary
  ) {
    return next(new ErrorHandler("Please provide all required fields.", 400));
  }



  //emp id config
  const empIdConfig = await EmpIdConfig.findOne();
  let finalEmployeeId = employeeId;

  if (empIdConfig?.autoGenerate) {
    const count = await Employee.countDocuments();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const idNumber = String(count + 1).padStart(empIdConfig.idNumberLength, '0');
    finalEmployeeId = `${empIdConfig.idPrefix}/${month}/${idNumber}`;
  }

  if (!finalEmployeeId) {
    return next(new ErrorHandler("Employee ID is required or failed to generate automatically", 400));
  }

  //chk existing user and employee
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("User already exists with this email", 400));
  }

  const existingEmployee = await Employee.findOne({ employeeId: finalEmployeeId });
  if (existingEmployee) {
    return next(new ErrorHandler("Employee ID already exists", 400));
  }

  const existingDepartment = await Department.findOne({ name: department });
  if (!existingDepartment) {
    return next(new ErrorHandler("Department does not exist", 400));
  }

  const existingPosition = await Position.findOne({ name: position });
  if (!existingPosition) {
    return next(new ErrorHandler("Position does not exist", 400));
  }

  const requiredDocTypes = ['empIdProof', 'empPhoto', 'emp10PassCert', 'emp12PassCert', 'empGradCert', 'empExpCert']

  console.log(requiredDocTypes)

  const missingDocs = requiredDocTypes.filter(type => !req.files[type] || req.files[type].length === 0);
  if (missingDocs.length > 0) {
    return next(new ErrorHandler(`Please upload all required documents.Missing Document(s): ${missingDocs.join(', ')}`, 400));
  }





  
  const user = await User.create({
    email,
    password: finalEmployeeId,
    role: 'Employee'
  })

  const salary = await Salary.create({
    user: user._id,
    salaryCycle,
    basic,
    allowances,
    deductions,
    netSalary,
  })

  const bankAccount = await BankAccount.create({
    bankName,
    accountNumber,
    ifscCode,
  })

  //req.files={empPhoto:[{fieldname,originalname,encoding,mimetype,path(cloud),size,filename(cloud)}], empIdProof:[{}]}
  //fields -> empIdProof,empPhoto,emp10PassCert,emp12PassCert,empGradCert,empExpCert
  // console.log(req.files);

  // const requiredDocTypes = ['empIdProof', 'empPhoto', 'emp10PassCert', 'emp12PassCert', 'empGradCert', 'empExpCert']

  // const missingDocs = requiredDocTypes.filter(type => !req.files[type] || req.files[type].length === 0);
  // if (missingDocs.length > 0) {
  //   return next(new ErrorHandler(`Please upload all required documents.Missing Document(s): ${missingDocs.join(', ')}`, 400));
  // }

  const documents = []

  if (req.files) {
    for (const field in req.files) { //req.files obj
      if (!DOCUMENT_TYPE_ENUM.includes(field)) {
        return next(new ErrorHandler(`${field} is not a valid document type`, 400));
      }

      for (let file of req.files[field]) { //field arr
        const { path, filename, mimetype } = file
        if (!path || !filename || !mimetype) {
          return next(new ErrorHandler("Invalid file upload", 400));
        }

        const document = await Document.create({
          user: user._id,
          type: field,
          fileUrl: path,
          publicId: filename,
          fileMimeType: mimetype,
        })
        documents.push(document._id)
      }
    }
  }

  const employee = await Employee.create({
    user: user._id,
    employeeId: finalEmployeeId,
    fullName,
    contactNo,
    emergencyContact: {
      name: emgContactName,
      phone: emergencyContact
    },
    department: existingDepartment._id,
    position: existingPosition._id,
    address,
    permanentAddress,
    bio,
    joiningDate,
    documents,
    salaryDetails: [salary._id],
    bankDetails: bankAccount._id,
  })

  res.status(201).json({
    success: true,
    message: "Employee added successfully",
    employee
  })
})

//------department and position related controllers------//
export const addDepartment = catchAsyncErrors(async (req, res, next) => {
  const loggedInUserId = req.user.id

  const { name } = req.body;
  if (!name) {
    return next(new ErrorHandler("Department name is required", 400));
  }

  const existingDepartment = await Department.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
  if (existingDepartment) {
    return next(new ErrorHandler("Department already exists", 400));
  }

  const department = await Department.create({
    name,
    createdBy: loggedInUserId
  });

  res.status(201).json({
    success: true,
    message: "Department added successfully",
    department
  });
})

export const deleteDepartment = catchAsyncErrors(async (req, res, next) => {
  const { deptId } = req.params;
  if (!deptId) {
    return next(new ErrorHandler("Department ID is required", 400));
  }

  const department = await Department.findById(deptId);
  if (!department) {
    return next(new ErrorHandler("Department not found", 404));
  }

  // Remove department from employees and set to null
  await Employee.updateMany(
    { department: deptId },
    { $set: { department: null } }
  )

  await Department.findByIdAndDelete(deptId);

  res.status(200).json({
    success: true,
    message: "Department deleted successfully and all employees' departments set to null"
  });
})

export const getAllDepartments = catchAsyncErrors(async (req, res, next) => {
  const departments = await Department.find();

  res.status(200).json({
    success: true,
    departments
  });
});

export const addPosition = catchAsyncErrors(async (req, res, next) => {
  const loggedInUserId = req.user.id

  const { name } = req.body;
  if (!name) {
    return next(new ErrorHandler("Position name is required", 400));
  }

  const existingPosition = await Position.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
  if (existingPosition) {
    return next(new ErrorHandler("Position already exists", 400));
  }

  const position = await Position.create({
    name,
    createdBy: loggedInUserId
  });

  res.status(201).json({
    success: true,
    message: "Position added successfully",
    position
  });
})

export const deletePosition = catchAsyncErrors(async (req, res, next) => {
  const { posId } = req.params;
  if (!posId) {
    return next(new ErrorHandler("Position ID is required", 400));
  }

  const position = await Position.findById(posId);
  if (!position) {
    return next(new ErrorHandler("Position not found", 404));
  }

  // Remove position from employees and set to null
  await Employee.updateMany(
    { position: posId },
    { $set: { position: null } }
  )

  await Position.findByIdAndDelete(posId);

  res.status(200).json({
    success: true,
    message: "Position deleted successfully and all employees' positions set to null"
  });
})

export const getAllPositions = catchAsyncErrors(async (req, res, next) => {
  const positions = await Position.find();

  res.status(200).json({
    success: true,
    positions
  });
})

//------settings related controllers------//
export const getEmpIdConfig = catchAsyncErrors(async (req, res, next) => {
  let empIdConfig = await EmpIdConfig.findOne();

  if (!empIdConfig) {
    empIdConfig = await EmpIdConfig.create({});
  }

  res.status(200).json({
    success: true,
    empIdConfig
  });
})

export const setEmpIdConfig = catchAsyncErrors(async (req, res, next) => {
  const { autoGenerate, idPrefix, idNumberLength } = req.body;

  let empIdConfig = await EmpIdConfig.findOne();

  if (!empIdConfig) {
    empIdConfig = await EmpIdConfig.create({
      autoGenerate,
      idPrefix,
      idNumberLength
    });
  } else {
    empIdConfig.autoGenerate = autoGenerate ?? empIdConfig.autoGenerate;
    empIdConfig.idPrefix = idPrefix ?? empIdConfig.idPrefix;
    empIdConfig.idNumberLength = idNumberLength ?? empIdConfig.idNumberLength;
    await empIdConfig.save();
  }

  res.status(200).json({
    success: true,
    message: "Employee ID configuration set successfully",
    empIdConfig
  });
})

export const getStandardWorkingHour = catchAsyncErrors(async (req, res, next) => {
  let standardWorkingHours = await StandardWorkingHour.findOne();

  if (!standardWorkingHours) {
    standardWorkingHours = await StandardWorkingHour.create({});
  }

  res.status(200).json({
    success: true,
    standardWorkingHours
  });
})

export const setStandardWorkingHour = catchAsyncErrors(async (req, res, next) => {
  const { startTime, endTime, breakDurationInMin, weeklyHours } = req.body;

  let standardWorkingHour = await StandardWorkingHour.findOne()

  if (!standardWorkingHour) {
    standardWorkingHour = await StandardWorkingHour.create({
      startTime,
      endTime,
      breakDurationInMin,
      weeklyHours
    })
  } else {
    standardWorkingHour.startTime = startTime ?? standardWorkingHour.startTime;
    standardWorkingHour.endTime = endTime ?? standardWorkingHour.endTime;
    standardWorkingHour.breakDurationInMin = breakDurationInMin ?? standardWorkingHour.breakDurationInMin;
    standardWorkingHour.weeklyHours = weeklyHours ?? standardWorkingHour.weeklyHours;
    await standardWorkingHour.save()
  }

  res.status(200).json({
    success: true,
    message: "Standard Working Hour configuration set successfully",
    standardWorkingHour
  });
})

export const getReviewCycleConfig = catchAsyncErrors(async (req, res, next) => {
  let reviewCycleConfig = await ReviewCycleConfig.findOne();

  if (!reviewCycleConfig) {
    reviewCycleConfig = await ReviewCycleConfig.create({});
  }

  res.status(200).json({
    success: true,
    reviewCycleConfig
  });
})

export const setReviewCycleConfig = catchAsyncErrors(async (req, res, next) => {
  const { reviewFrequency, reviewDayOfMonth, autoGenerateReviewForm } = req.body;

  let reviewCycleConfig = await ReviewCycleConfig.findOne();

  if (!reviewCycleConfig) {
    reviewCycleConfig = await ReviewCycleConfig.create({
      reviewFrequency,
      reviewDayOfMonth,
      autoGenerateReviewForm
    });
  }
  else {
    reviewCycleConfig.reviewFrequency = reviewFrequency ?? reviewCycleConfig.reviewFrequency;
    reviewCycleConfig.reviewDayOfMonth = reviewDayOfMonth ?? reviewCycleConfig.reviewDayOfMonth;
    reviewCycleConfig.autoGenerateReviewForm = autoGenerateReviewForm ?? reviewCycleConfig.autoGenerateReviewForm;
    await reviewCycleConfig.save();
  }

  res.status(200).json({
    success: true,
    message: "Review Cycle configuration set successfully",
    reviewCycleConfig
  });
})

export const getTaskScoreConfig = catchAsyncErrors(async (req, res, next) => {
  let taskScoreConfig = await TaskScoreConfig.findOne();

  if (!taskScoreConfig) {
    taskScoreConfig = await TaskScoreConfig.create({});
  }

  res.status(200).json({
    success: true,
    taskScoreConfig
  });
})

export const setTaskScoreConfig = catchAsyncErrors(async (req, res, next) => {
  const { minScore, maxScore } = req.body;

  let taskScoreConfig = await TaskScoreConfig.findOne();

  if (!taskScoreConfig) {
    taskScoreConfig = await TaskScoreConfig.create({
      minScore,
      maxScore,
    });
  }
  else {
    taskScoreConfig.minScore = minScore ?? taskScoreConfig.minScore;
    taskScoreConfig.maxScore = maxScore ?? taskScoreConfig.maxScore;
    await taskScoreConfig.save();
  }

  res.status(200).json({
    success: true,
    message: "Task Score configuration set successfully",
    taskScoreConfig
  });
})


export const getPerfMetricsConfig = catchAsyncErrors(async (req, res, next) => {
  let perfMetricConfig = await PerfMetricsConfig.findOne();

  if (!perfMetricConfig) {
    perfMetricConfig = await PerfMetricsConfig.create({})
  }

  res.status(200).json({
    success: true,
    perfMetricConfig
  });
})

export const setPerfMetricsConfig = catchAsyncErrors(async (req, res, next) => {
  const { metrics } = req.body; //[{name,fullName,enabled}]

  if (!Array.isArray(metrics) || metrics.length === 0) {
    return next(new ErrorHandler("Performance metrics must be a non-empty array", 400));
  }

  let perfMetricConfig = await PerfMetricsConfig.findOne();

  if (!perfMetricConfig) {
    perfMetricConfig = await PerfMetricsConfig.create({ metrics });
  } else {
    perfMetricConfig.metrics = metrics;
    await perfMetricConfig.save();
  }

  res.status(200).json({
    success: true,
    message: "Performance Metric configuration set successfully",
    perfMetricConfig
  });
});




export const getSinglePayslip = catchAsyncErrors(async (req, res, next) => {
  const payslipId = req.params.id;

  const payslip = await Payslip.findById(payslipId)
    .populate({
      path: "employee",
      populate: [
        { path: "position" },
        { path: "department" },
        { path: "bankDetails" }
      ]
    });

  if (!payslip) {
    return res.status(404).json({ success: false, message: "Payslip not found" });
  }

  const emp = payslip.employee;

  const response = {
    company: {
      name: "NovaNectar Private Limited",
      address: "123 Business Park, Mumbai, India",
      gst: "27AABCU9603R1ZX"
    },
    month: payslip.month,
    year: payslip.year,

    employee: {
      name: emp.fullName,
      id: emp.employeeId,
      department: emp.department?.name || "N/A",
      position: emp.position?.name || "N/A",
      bankAccount: emp.bankDetails?.accountNumber
        ? maskBankAccount(emp.bankDetails.accountNumber)
        : "N/A",
      pan: emp.bankDetails?.pan || "N/A"
    },

    payment: {
      status: payslip.paymentStatus,
      date: payslip.paymentDate ? formatDate(payslip.paymentDate) : "Pending"
    },

    attendance: {
      present: payslip.attendance.present,
      absent: payslip.attendance.absent,
      onLeave: payslip.attendance.onLeave,
      holidays: payslip.attendance.holidays
    },

    earnings: {
      basic: payslip.earnings.basic,
      hra: payslip.earnings.hra,
      vehiclePetrol: payslip.earnings.vehiclePetrol,
      medicalAllowance: payslip.earnings.medicalAllowance,
      grossSalary: payslip.grossSalary
    },

    deductions: {
      professionalTax: payslip.deductions.professionalTax,
      tds: payslip.deductions.tds,
      pf: payslip.deductions.pf,
      attendanceDeduction: payslip.deductions.attendanceDeduction,
      totalDeductions: payslip.totalDeductions
    },

    netSalary: payslip.netSalary,
    amountInWords: convertToWords(payslip.netSalary)
  };

  res.status(200).json({
    success: true,
    payslip: response
  });
});


const maskBankAccount = (accountNumber) => {
  const last4 = accountNumber.slice(-4);
  return `XXXX-XXXX-${last4}`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

const convertToWords = (num) => {

  return `Fifteen Thousand Three Hundred Twenty rupees only`; 
};


export const getAllEmployeeCards = catchAsyncErrors(async (req, res, next) => {
  const payslips = await Payslip.find()
    .populate({
      path: "employee",
      populate: { path: "position" }
    })
    .sort({ createdAt: -1 });

  const latestPayslipsMap = new Map();

  payslips.forEach(payslip => {
    const empId = payslip.employee._id.toString();
    if (!latestPayslipsMap.has(empId)) {
      latestPayslipsMap.set(empId, payslip);
    }
  });

  const formatted = Array.from(latestPayslipsMap.values()).map(payslip => {
    const emp = payslip.employee;
    const fullName = emp.fullName;
    const employeeId = emp.employeeId;
    const role = emp.position?.name || "Unknown";

    const totalAllowances = 
      payslip.earnings.hra +
      payslip.earnings.vehiclePetrol +
      payslip.earnings.medicalAllowance;

    const totalDeductions = payslip.totalDeductions;

    return {
      name: fullName,
      id: employeeId,
      role: role,
      attendance: {
        P: payslip.attendance.present,
        A: payslip.attendance.absent,
        L: payslip.attendance.onLeave
      },
      basicSalary: payslip.earnings.basic,
      allowances: totalAllowances,
      deductions: totalDeductions,
      netSalary: payslip.netSalary,
      paymentStatus: payslip.paymentStatus,
      payslipId: payslip._id,
      month: payslip.month,
      year: payslip.year
    };
  });

  res.status(200).json({
    success: true,
    employees: formatted
  });
});



export const updateAttendance = catchAsyncErrors(async (req, res, next) => {
  try {
    const { attendanceId } = req.params;
    const {
      date,
      status,
      punchIn,
      punchOut,
      locationType,
      notes
    } = req.body;

 
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      attendanceId,
      {
        date,
        status,
        punchIn,
        punchOut,
        locationType,
        notes
      },
      { new: true }
    );

    if (!updatedAttendance) {
      return next(new ErrorHandler("Attendance record not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: updatedAttendance
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});










export const getSettings = catchAsyncErrors(async (req, res, next) => {
  const settings = await Settings.findOne();
  if (!settings) return next(new ErrorHandler('Settings not found', 404));
  res.status(200).json({ success: true,  settings });
});


export const saveGeneralSettings = catchAsyncErrors(async (req, res, next) => {
  const {
   companyInfo,
      systemDefaults,
      preferences,
  } = req.body;


    const updates = {
      ...(companyInfo && { companyInfo }),
      ...(systemDefaults && { systemDefaults }),
      ...(preferences && { preferences }),
    }


  let settings = await Settings.findOne();

  if (!settings) {
   
    settings = new Settings(updates);
  } else {

    if (companyInfo) settings.companyInfo = companyInfo;
    if (systemDefaults) settings.systemDefaults = systemDefaults;
    if (preferences) settings.preferences = preferences;
  }

  await settings.save();




  res.status(200).json({ success: true, message: "Settings saved successfully", settings 
   });
  
});




function deepMerge(target, source) {
  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      if (!target[key] || typeof target[key] !== "object") {
        target[key] = {};
      }
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}



export const updateSettings = catchAsyncErrors(async (req, res, next) => {
  const updates = req.body;

  if (!updates || Object.keys(updates).length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No data provided to update." });
  }

  if (updates.workConfig && updates.workConfig.weekendDays) {
    if (!Array.isArray(updates.workConfig.weekendDays)) {
      return res
        .status(400)
        .json({ success: false, message: "weekendDays must be an array." });
    }
  }

  if (updates.attendanceRules) {
    const { autoMarkAbsent, autoAbsentAfterHours } = updates.attendanceRules;
    if (autoMarkAbsent && (!autoAbsentAfterHours || autoAbsentAfterHours <= 0)) {
      return next(
        new ErrorHandler(
          "autoAbsentAfterHours must be > 0 if autoMarkAbsent is enabled.",
          400
        )
      );
    }
  }

  let settings = await Settings.findOne();

  if (!settings) {
    settings = new Settings(updates);
  } else {

    for (const key of Object.keys(updates)) {
      if (
        updates[key] &&
        typeof updates[key] === "object" &&
        !Array.isArray(updates[key])
      ) {
        settings[key] = deepMerge(
          settings[key] ? settings[key].toObject() || {} : {},
          updates[key]
        );
      } else {
        settings[key] = updates[key];
      }
    }
  }

  await settings.save();

  res.status(200).json({
    success: true,
    message: "Settings updated successfully",
    data: settings,
  });
});







export const updatePayrollSettings = catchAsyncErrors(async (req, res, next) => {
  const updates = req.body;

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: "No data provided to update."
    });
  }
if (updates.salaryStructure) {
  const { basicSalary, deductionPercentage, transportAllowancePercentage } = updates.salaryStructure;

  if (typeof basicSalary !== "number" || basicSalary <= 0) {
    return next(new ErrorHandler("Basic Salary must be a positive number", 400));
  }
  if (typeof deductionPercentage !== "number" || deductionPercentage < 0) {
    return next(new ErrorHandler("Deduction percent must be a non-negative number", 400));
  }
  if (typeof transportAllowancePercentage !== "number" || transportAllowancePercentage < 0) {
    return next(new ErrorHandler("Transport Allowance percent must be a non-negative number", 400));
  }
}


  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings(updates);
  } else {
  
    for (const key of Object.keys(updates)) {
      if (
        updates[key] &&
        typeof updates[key] === "object" &&
        !Array.isArray(updates[key])
      ) {
        settings[key] = deepMerge(
          settings[key] ? settings[key].toObject() || {} : {},
          updates[key]
        );
      } else {
        settings[key] = updates[key];
      }
    }
  }

  await settings.save();

  res.status(200).json({
    success: true,
    message: "Payroll settings updated successfully",
    data: settings
  });
});





export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next(new ErrorHandler("You're not logged in", 401));
  }


  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'none',
    expires: new Date(0),
  });


  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'none',
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: "You have been logged out securely.",
  });
});
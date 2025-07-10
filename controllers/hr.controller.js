
import { nanoid } from "nanoid";
import User from "../models/user.model.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import Employee from "../models/employee.model.js";
import Leave from "../models/leave.model.js";


export const addEmployee = catchAsyncErrors( async (req, res, next) => {
  const { fullName, email, department, position, phone, ...rest } = req.body;

try {

      const existing = await User.findOne({ email });
      if (existing) return next( new ErrorHandler("User already exists", 402 ))
    
      const password = "emp@123";
      const employeeId = `EMP${nanoid(6).toUpperCase()}`;
    
      const user = await User.create({
        email,
        password,
        role: "employee",
      });
    
      const profile = await Employee.create({
        user: user._id,
        employeeId,
        fullName,
        department,
        position,
        phone,
        ...rest,
      });
    
      res.status(201).json({
        message: "Employee created by HR",
        user: user._id,
        profile
        
      });
} catch (error) {
    return next( new ErrorHandler(error.message, 500))
}
});

export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password , role } = req.body;

  try {
    if (!email || !password || !role) {
      return next(new ErrorHandler("please provide email and password", 400));
    }

    const user = await User.findOne({email}).select("+password")


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


    const{ accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);



    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "Strict",
    });


    res.status(200).json({
      message: "Login successfully",
      accessToken,
      user:{
        id: user._id,
      email: user.email,
      role: user.role,
      

      }
    })

    
  } catch (error) {
    return next( new ErrorHandler(error.message,  400))
  }
}) ;


export const getLeavesWithEmployeeName = catchAsyncErrors(async (req, res, next) => {
 
  const leaves = await Leave.find()
    .populate("user", "email role",) 
    .lean();


  const enrichedLeaves = await Promise.all(leaves.map(async (leave) => {
    const employee = await Employee.findOne({ user: leave.user._id }).select("fullName");
    return {
      ...leave,
      fullName: employee?.fullName || "N/A",
    };
  }));

  res.status(200).json({
    success: true,
    count: enrichedLeaves.length,
    leaves: enrichedLeaves,
  });
});


export const reviewLeave = catchAsyncErrors(async (req, res, next) => {
  const { leaveId } = req.params;
  const userId = req.user.id;
  const { status } = req.body; 


  const allowedStatuses = ['Approved', 'Rejected'];
  if (!allowedStatuses.includes(status)) {
    return next(new ErrorHandler(`Invalid status. Allowed values: ${allowedStatuses.join(', ')}`, 400));
  }

  const leave = await Leave.findById(leaveId);
  if (!leave) {
    return next(new ErrorHandler('Leave request not found', 404));
  }

  if (leave.status !== 'Pending') {
    return next(new ErrorHandler('Leave request is already reviewed', 400));
  }

  leave.status = status;
  leave.reviewedBy = userId;
  leave.reviewedAt = new Date();

  await leave.save();


  await sendNotification({
  userId: leave.user,
  title: "Leave Request Update",
  message: `Your leave request from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been ${leave.status}.`,
  type: "Leave",
  createdBy: req.user.id,
});


  res.status(200).json({
    success: true,
    message: `Leave request ${status.toLowerCase()} successfully`,
    leave,
  });




});


export const reviewEditRequest = catchAsyncErrors(async (req, res, next) => {
  const { requestId } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  if (!['Approved', 'Rejected'].includes(status)) {
    return next(new ErrorHandler('Invalid status value', 400));
  }

  const request = await DocumentEdit.findById(requestId);
  if (!request) return next(new ErrorHandler('Edit request not found', 404));

  if (request.status !== 'Pending') {
    return next(new ErrorHandler('This request has already been reviewed', 400));
  }

  request.status = status;
  request.reviewedBy = userId;
  request.reviewedAt = new Date();

  await request.save();


   await sendNotification({
    userId: DocumentEdit.id,
    title: "Document Edit Request Update",
    message: `Your edit request for document "${request.document.name}" has been ${status.toLowerCase()}.`,
    type: "Document",
    createdBy: reviewerId,
  });

  res.status(200).json({
    success: true,
    message: `Edit request ${status.toLowerCase()}`,
    request,
  });
});







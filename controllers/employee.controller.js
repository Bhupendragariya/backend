import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import Document from "../models/document.model.js";
import DocumentEdit from "../models/documentEdit.model.js";
import Employee from "../models/employee.model.js";
import Leave from "../models/leave.model.js";
import User from "../models/user.model.js";
import { generateAccessAndRefreshTokens } from "../util/jwtToken.js";

export const refreshAccessToken = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    return next(new ErrorHandler(401, "unauthorized request"));
  }

  try {
    const decoded = JsonWebTokenError.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user) {
      return next(new ErrorHandler(401, "invalid refresh  token"));
    }

    if (!user.refreshToken || user.refreshToken !== incomingRefreshToken) {
      return next(new ErrorHandler("Invalid refresh token", 401));
    }

    const { accessToken, refreshToken: newRefreshToken } =
      generateAccessAndRefreshTokens(user._id);
    user.refreshToken = newRefreshToken;
    await user.save();

    const cookieName =
      user.role === "Admin"
        ? "adminToken"
        : user.role === "HR"
        ? "hrToken"
        : "employeeToken";

    res.cookie(cookieName, newRefreshToken, {
      httpOnly: true,
      sameSite: "Strict",
    });

    res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    return next(new ErrorHandler("invalid refresh token", 401));
  }
});

export const getEmployeeDashboard = catchAsyncErrors(async (req, res, next) => {


  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "-password -refreshToken -otp"
    );

  

      const employee = await Employee.findOne({ user: userId });
    

    if (!employee) {
      return next(new ErrorHandler("employ profile  not found  ", 400));
    }
    
    res.status(200).json({
      message: "Employee Dashboard", 
      user,
      employee,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const applyLeave = catchAsyncErrors(async (req, res, next) => {
  const { leaveType, startDate, endDate, reason, comment } = req.body;

  try {


      if (!req.user || !req.user.id) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

     if (!leaveType || !startDate || !endDate || !reason) {
    return next(
      new ErrorHandler("Please provide all required fields", 400)
    );
  }


  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return next(new ErrorHandler("Invalid date format", 400));
  }

  if (start > end) {
    return next(new ErrorHandler("Start date cannot be after end date", 400));
  }

    const newLeave = new Leave({
      user: req.user.id,
      leaveType,
      startDate,
      endDate,
      reason,
      comment,
    });

    await newLeave.save();

    res.status(201).json({
      message: "Leave request submitted successfully",
      leave: newLeave,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const employeeLogin = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;

  try {
    if (!email || !password || !role) {
      return next(new ErrorHandler("please provide email and password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHandler("invalid user and password", 400));
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

    const employee = await Employee.findOne({ user: user._id });
    if (!employee) {
      return next(new ErrorHandler("Employee profile not found", 404));
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "Strict",
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "Strict",
    });

    res.status(200).json({
      message: "Login successfully",
      accessToken,
      
      employee,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});




export const createEditRequest = catchAsyncErrors( async( req, res, next) =>{

  const { documentId, reason } = req.body;

  const userId = req.user.id;

  try {

    const document = await Document.findById(documentId);
    if (!document) return next(new ErrorHandler('Document not found', 404));



    if (document.user.toString() !== userId) {
    return next(new ErrorHandler('You do not have permission to edit this document', 403));
  }

  const existingRequest = await DocumentEdit.findOne({
    document: documentId,
    requestedBy: userId,
    status: 'Pending'
  });

   if (existingRequest) {
    return next(new ErrorHandler('You already have a pending edit request for this document', 400));
  }

   const editRequest = await DocumentEdit.create({
    document: documentId,
    requestedBy: userId,
    reason,
  });


  res.status(201).json({
    success: true,
    message: 'Edit request submitted successfully',
    editRequest,
  })

    
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
})




export const editDocument = catchAsyncErrors(async (req, res, next) => {
  const { documentId } = req.params;
  const userId = req.user.id;
  const { name, fileUrl, type } = req.body;


  const document = await Document.findById(documentId);
  if (!document) return next(new ErrorHandler('Document not found', 404));


  if (document.user.toString() !== userId) {
    return next(new ErrorHandler('You do not have permission to edit this document', 403));
  }


  const approvedRequest = await DocumentEdit.findOne({
    document: documentId,
    requestedBy: userId,
    status: 'Approved'
  });
  if (!approvedRequest) {
    return next(new ErrorHandler('No approved edit request found for this document', 403));
  }


  if (name) document.name = name;
  if (fileUrl) document.fileUrl = fileUrl;
  if (type) document.type = type;

  await document.save();

  await approvedRequest.remove();

  res.status(200).json({
    success: true,
    message: 'Document updated successfully',
    document,
  });
});


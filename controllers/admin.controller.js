import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import Employee from "../models/employee.model.js";
import Leave from "../models/leave.model.js";
import User from "../models/user.model.js";
import { generateAccessAndRefreshTokens } from "../util/jwtToken.js";
import { nanoid } from "nanoid";
import { sendNotification } from "../util/notification.js";
import DocumentEdit from "../models/documentEdit.model.js";
import cloudinary from "../config/cloudinary.js";

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

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "Strict",
    });

    res.status(200).json({
      message: "Login successfully",
      accessToken,
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

export const addEmployee = catchAsyncErrors(async (req, res, next) => {
  const { fullName, email, department, position, phone, ...rest } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return next(new ErrorHandler("User already exists", 402));

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


      await sendNotification({
      userId: user._id,
      title: "Welcome to the Team!",
      message: `Welcome aboard, ${fullName}! We're excited to have you join as a ${position}.`,
      type: "Employee",
      createdBy: req.user?.id || null, 
    });

    res.status(201).json({
      message: "Employee created by HR",
      user: user._id,
      profile,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const getLeavesWithEmployeeName = catchAsyncErrors(
  async (req, res, next) => {
    const leaves = await Leave.find().populate("user", "email role").lean();

    const enrichedLeaves = await Promise.all(
      leaves.map(async (leave) => {
        const employee = await Employee.findOne({
          user: leave.user._id,
        }).select("fullName");
        return {
          ...leave,
          fullName: employee?.fullName || "N/A",
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedLeaves.length,
      leaves: enrichedLeaves,
    });
  }
);

export const reviewLeave = catchAsyncErrors(async (req, res, next) => {
  const { leaveId } = req.params;
  const userId = req.user.id;
  const { status } = req.body;

  const allowedStatuses = ["Approved", "Rejected"];
  if (!allowedStatuses.includes(status)) {
    return next(
      new ErrorHandler(
        `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
        400
      )
    );
  }

  const leave = await Leave.findById(leaveId);
  if (!leave) {
    return next(new ErrorHandler("Leave request not found", 404));
  }

  if (leave.status !== "Pending") {
    return next(new ErrorHandler("Leave request is already reviewed", 400));
  }

  leave.status = status;
  leave.reviewedBy = userId;
  leave.reviewedAt = new Date();

  await leave.save();

  await sendNotification({
    userId: leave.user.id,
    title: "Leave Request Update",
    message: `Your leave request from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been ${
      leave.status
    }.`,
    type: "Leave",
    createdBy: req.user.id,
  });

  res.status(200).json({
    success: true,
    message: `Leave request ${status.toLowerCase()} successfully`,
    leave,
  });
});




//document
export const approveUpdateRequest = catchAsyncErrors(async (req, res, next) => {
  const { docId } = req.params;

  const document = await Document.findById(docId);
  if (!document || document.status !== 'pending-update') {
    return next(new ErrorHandler("No pending update request found", 404));
  }

  // Delete old Cloudinary file
  if (document.publicId) {
    await cloudinary.uploader.destroy(document.publicId);
  }

  // Apply requested changes
  const requestedChanges = document.requestedChanges;

  document.type = requestedChanges.type;
  document.fileUrl = requestedChanges.fileUrl;
  document.publicId = requestedChanges.publicId;
  document.fileMimeType = requestedChanges.fileMimeType;
  document.status = 'approved';
  document.reasonForRequest = undefined;
  document.requestedChanges = undefined;

  await document.save();

  res.status(200).json({
    success: true,
    message: "Document update approved",
    document
  });
});




export const approveDeleteRequest = catchAsyncErrors(async (req, res, next) => {
  const { docId } = req.params;

  const document = await Document.findById(docId);
  if (!document || document.status !== 'pending-delete') {
    return next(new ErrorHandler("No pending delete request found", 404));
  }

  // Delete doc from Cloudinary
  if (document.publicId) {
    await cloudinary.uploader.destroy(document.publicId);
  }

  // Remove doc from doc data
  await Document.findByIdAndDelete(docId);

  // Remove from employee data
  await Employee.findByIdAndUpdate(document.user, {
    $pull: { documents: docId }
  });

  res.status(200).json({
    success: true,
    message: "Document delete approved"
  });
});

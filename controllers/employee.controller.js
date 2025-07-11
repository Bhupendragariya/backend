import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import BankAccount from "../models/banckAccoun.model.js";
import Document from "../models/document.model.js";
import Employee from "../models/employee.model.js";
import Leave from "../models/leave.model.js";
import Resignation from "../models/resignation.model.js";
import User from "../models/user.model.js";
import { generateAccessAndRefreshTokens } from "../util/jwtToken.js";
import cloudinary from "../config/cloudinary.js";
import { sendNotification } from "../util/notification.js";




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

      const hrAndAdmins = await User.find({ role: { $in: ['hr', 'admin'] } });

    for (const recipient of hrAndAdmins) {
      await sendNotification({
        userId: recipient._id,
        title: "New Leave Request",
        message: `${req.user.name} requested leave from ${start.toDateString()} to ${end.toDateString()}.`,
        type: "Leave",
        createdBy: req.user.id,
      });
    }

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


//notifaction  messsagess like red unread 

export const getNotifications = catchAsyncErrors(async (req, res, next) => {

    if (!req.user || !req.user.id) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: notifications.length,
    notifications,
  });
});

export const getUnreadNotifications = catchAsyncErrors(async (req, res, next) => {

    if (!req.user || !req.user.id) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  const notifications = await Notification.find({
    user: req.user.id,
    read: false,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: notifications.length,
    notifications,
  });
});


export const markNotificationAsRead = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

 if (!req.user || !req.user.id) {
    return next(new ErrorHandler("User not authenticated", 401));
  }


  const notification = await Notification.findById(id);
  if (!notification || notification.user.toString() !== req.user.id) {
    return next(new ErrorHandler("Notification not found or unauthorized", 404));
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    success: true,
    message: "Marked as read",
  });
});



export const changePassword = catchAsyncErrors(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  const userId = req.user.id; 

  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  if (newPassword !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  const user = await User.findById(userId).select("+password");
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const isPasswordMatched = await user.comparePassword(currentPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Incorrect current password", 401));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});




export const addOrUpdateBankAccount = catchAsyncErrors(async (req, res, next) => {
  const { bankName, accountNumber, ifscCode, upiId } = req.body;

  if (!req.user || !req.user.id) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  if (!bankName || !accountNumber || !ifscCode) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  const employee = await Employee.findOne({ user: req.user.id });

  if (!employee) {
    return next(new ErrorHandler("Employee record not found", 404));
  }

  if (employee.bankAccounts) {
    const bankAccount = await BankAccount.findById(employee.bankAccounts);

    if (bankAccount) {
      bankAccount.bankName = bankName;
      bankAccount.accountNumber = accountNumber;
      bankAccount.ifscCode = ifscCode;
      bankAccount.upiId = upiId || null;

      await bankAccount.save();

      return res.status(200).json({
        message: "Bank account updated successfully",
        bankAccount,
      });
    }
  }

  const newBankAccount = new BankAccount({
    bankName,
    accountNumber,
    ifscCode,
    upiId: upiId || null,
  });

  await newBankAccount.save();

 
  employee.bankAccounts = newBankAccount._id;
  await employee.save();

  

  res.status(201).json({
    message: "Bank account added successfully",
    bankAccount: newBankAccount,
  });
});



export const submitResignation = catchAsyncErrors(async (req, res, next) => {
  const { reason, note, proposedLastWorkingDate } = req.body;

  if (!req.user || !req.user.id) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  if (!reason || !note || !proposedLastWorkingDate) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  const proposedDate = new Date(proposedLastWorkingDate);
  if (isNaN(proposedDate.getTime())) {
    return next(new ErrorHandler("Invalid date format", 400));
  }


  const today = new Date();
  const diffTime = proposedDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return next(new ErrorHandler("Minimum 30 days notice period required", 400));
  }


  const existingResignation = await Resignation.findOne({ user: req.user.id, status: "pending" });
  if (existingResignation) {
    return next(new ErrorHandler("You already have a pending resignation request", 400));
  }

  const resignation = new Resignation({
    user: req.user.id,
    reason,
    note,
    proposedLastWorkingDate: proposedDate,
  });

  await resignation.save();

const hrAndAdmins = await User.find({ role: { $in: ['hr', 'admin'] } });

     for (const recipient of hrAndAdmins) {
      await sendNotification({
        userId: recipient._id,
        title: "New Resignation Request",
        message: `${req.user.name} requested Resignation ${proposedDate.toDateString()}.`,
        type: "Resignation",
        createdBy: req.user.id,
      });
    }

  res.status(201).json({
    success: true,
    message: "Resignation submitted successfully",
    resignation,
  });
});



export const addDocument = catchAsyncErrors(async (req, res, next) => {
  
  const loggedInUserId = req.user.id
  console.log(loggedInUserId, req.user.role);

  const { empId } = req.params;
  if (!empId) {
    return next(new ErrorHandler("Employee ID is required", 400));
  }

  if (!req.file) {
    return next(new ErrorHandler("Please upload a document", 400));
  }

  const { path, filename, mimetype } = req.file
  if (!path || !filename || !mimetype) {
    return next(new ErrorHandler("Invalid file upload", 400));
  }

  const { type } = req.body;
  if (!type) {
    return next(new ErrorHandler("Please provide a document type", 400));
  }

  //if emp add doc to other emp
  if (req.user.role === "employee" && empId !== loggedInUserId) {
    return next(new ErrorHandler("You are not authorized to add document for this user", 403));
  }

  const document = await Document.create({
    user: empId,
    type,
    fileUrl: path, // cloudinary file url
    publicId: filename, // cloudinary public id
    fileMimeType: mimetype
  })

  if (!document) {
    return next(new ErrorHandler("Failed to upload document", 500));
  }

  await Employee.findByIdAndUpdate(empId, {
    $push: { documents: document._id }
  })


  const hrAndAdmins = await User.find({ role: { $in: ['hr', 'admin'] } });

for (const recipient of hrAndAdmins) {
  await sendNotification({
    userId: recipient._id,
    title: "add new document",
    message: `${document.user.name} add new document.`,
    type: "document",
    createdBy: req.user.id,
  });
}

  res.status(201).json({
    success: true,
    message: "Document uploaded successfully",
    document
  })
})



export const updateDocument = catchAsyncErrors(async (req, res, next) => {
  // req.file =>{fieldname,originalname,encoding,minetype,path,size,filename}
  const loggedInUserId = req.user.id
  console.log(loggedInUserId, req.user.role);

  const { empId, docId } = req.params;
  if (!empId || !docId) {
    return next(new ErrorHandler("Employee ID and Document ID both are required", 400));
  }

  if (!req.file) {
    return next(new ErrorHandler("Please upload a document", 400));
  }

  const { path, filename, mimetype } = req.file
  if (!path || !filename || !mimetype) {
    return next(new ErrorHandler("Invalid file upload", 400));
  }

  const { type, reason } = req.body;
  if (!type) {
    return next(new ErrorHandler("Please provide a document type", 400));
  }

  const document = await Document.findById(docId);
  if (!document) {
    return next(new ErrorHandler("Document to update not found", 500));
  }

  //---when emp try to update doc---update status,reason and req field only----
  if (req.user.role === "employee") {
    //if emp update doc of other emp 
    if (empId !== loggedInUserId) {
      return next(new ErrorHandler("You are not authorized to add document for this user", 403))
    }

    if (!reason || reason.trim() === "") {
      return next(new ErrorHandler("Reason for update request is required", 400));
    }

    document.status = "pending-update"
    document.reasonForRequest = reason || ""
    document.requestedChanges = {
      type,
      fileUrl: path,
      publicId: filename,
      fileMimeType: mimetype
    }
    await document.save();
    return res.status(201).json({
      success: true,
      message: "Update request submitted and pending HR/Admin approval",
    })
  }

  //---when hr/admin try to update doc---update whole doc----

  //delete old document from cloudinary
  if (document.publicId) {
    await cloudinary.uploader.destroy(document.publicId)
  }

  document.type = type;
  document.fileUrl = path; // cloudinary file url
  document.publicId = filename; // cloudinary public id
  document.fileMimeType = mimetype;
  document.status = "approved";
  document.requestedChanges = undefined;

  await document.save();


  const hrAndAdmins = await User.find({ role: { $in: ['hr', 'admin'] } });

for (const recipient of hrAndAdmins) {
  await sendNotification({
    userId: recipient._id,
    title: "update Document",
    message: `${document.user.name} update document.`,
    type: "document",
    createdBy: req.user.id,
  });
}

  res.status(201).json({
    success: true,
    message: "Document updated successfully",
    document
  })
})




///document
export const deleteDocument = catchAsyncErrors(async (req, res, next) => {
  const loggedInUserId = req.user.id
  console.log(loggedInUserId, req.user.role);

  const { empId, docId } = req.params;
  if (!empId || !docId) {
    return next(new ErrorHandler("Employee ID and Document ID both are required", 400));
  }

  const document = await Document.findById(docId);
  if (!document) {
    return next(new ErrorHandler("Document to delete not found", 500));
  }

  //---when emp try to delete doc---update status and reason only----
  if (req.user.role === "employee") {
    //if emp delete doc of other emp
    if (empId !== loggedInUserId) {
      return next(new ErrorHandler("You are not authorized to delete document for this user", 403))
    }

    const reason = req.body?.reason;  //req.body may be undefined if no body is sent in delete request
    if (!reason || reason.trim() === "") {
      return next(new ErrorHandler("Reason to delete request is required", 400));
    }

    document.status = "pending-delete"
    document.reasonForRequest = reason || ""
    await document.save();
    return res.status(200).json({
      success: true,
      message: "Delete request submitted and pending HR/Admin approval"
    });
  }

  //---when hr/admin try to delete doc---

  //delete document from cloudinary
  if (document.publicId) {
    await cloudinary.uploader.destroy(document.publicId)
  }

  await document.deleteOne();

  await Employee.findByIdAndUpdate(empId, {
    $pull: { documents: docId }
  });

  res.status(200).json({
    success: true,
    message: "Document deleted successfully",
    document
  })
})


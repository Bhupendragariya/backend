import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import BankAccount from "../models/banckAccount.model.js";
import Document from "../models/document.model.js";
import Employee from "../models/employee.model.js";
import Leave from "../models/leave.model.js";
import Resignation from "../models/resignation.model.js";
import User from "../models/user.model.js";
import { generateAccessAndRefreshTokens } from "../util/jwtToken.js";
import cloudinary from "../config/cloudinary.js";
import { sendNotification } from "../util/notification.js";
import sendEmail from '../util/sendEmail.js';
import fs from 'fs';
import Message from "../models/message.model.js";
import Feedback from "../models/feedback.model.js";




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

try {
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
} catch (error) {
   return next(new ErrorHandler(error.message, 400));
}
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

  const hrAndAdmins = await User.find({ role: { $in: ['hr', 'admin'] } });

  for (const recipient of hrAndAdmins) {
    await sendNotification({
      userId: recipient.id,
      title: "New Bank Account Added",
      message: `${req.user.fullName} has added a new bank account.`,
      type: "bank",
      createdBy: req.user.id,
    });
  }


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

  const { userId } = req.params;
  if (!userId) {
    return next(new ErrorHandler("User ID is required", 400));
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

  const validTypes = ['empIdProof', 'empPhoto', 'emp10PassCert', 'emp12PassCert', 'empGradCert', 'empExpCert', 'empResume', 'empOfferLetter', 'empOtherDoc'];
  if (!validTypes.includes(type)) {
    return next(new ErrorHandler(`Invalid document type. Allowed types are: ${validTypes.join(', ')}`, 400));
  }

  //if emp add doc to other emp
  if (req.user.role === "employee" && userId !== loggedInUserId) {
    return next(new ErrorHandler("You are not authorized to add document for this user", 403));
  }

  const existingDoc = await Document.findOne({ user: userId, type });
  if (existingDoc) {
    return next(new ErrorHandler("Document of this type already exists. Please request an update instead.", 409));
  }

  const document = await Document.create({
    user: userId,
    type,
    fileUrl: path, // cloudinary file url
    publicId: filename, // cloudinary public id
    fileMimeType: mimetype
  })

  if (!document) {
    return next(new ErrorHandler("Failed to upload document", 500));
  }

  const employee = await Employee.findOne({ user: userId })
  if (!employee) {
    return next(new ErrorHandler("Employee not found", 404));
  }

  employee.documents.push(document._id)
  await employee.save()

  // await Employee.findByIdAndUpdate(userId, {
  //   $push: { documents: document._id }
  // })


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

  const { userId, docId } = req.params;
  if (!userId || !docId) {
    return next(new ErrorHandler("User ID and Document ID both are required", 400));
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
    if (userId !== loggedInUserId) {
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
      userId: recipient.id,
      title: "Document Edit Request Received",
      message: `${document.user.name} has submitted a document request. Status: ${document.status}.`,
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

  const { userId, docId } = req.params;
  if (!userId || !docId) {
    return next(new ErrorHandler("User ID and Document ID both are required", 400));
  }

  const document = await Document.findById(docId);
  if (!document) {
    return next(new ErrorHandler("Document to delete not found", 500));
  }

  //---when emp try to delete doc---update status and reason only----
  if (req.user.role === "employee") {
    //if emp delete doc of other emp
    if (userId !== loggedInUserId) {
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

  const employee = await Employee.findOne({ user: userId })
  if (!employee) {
    return next(new ErrorHandler("Employee not found", 404));
  }

  employee.documents.pull(document._id)
  await employee.save()

  // await Employee.findByIdAndUpdate(empId, {
  //   $pull: { documents: docId }
  // });

  res.status(200).json({
    success: true,
    message: "Document deleted successfully",
    document
  })
})




///send a email
export const sendMessageToUser = catchAsyncErrors(async (req, res) => {
  try {
    const { recipientId, subject, message, type } = req.body;
    const file = req.file;
    const senderId = req.user.id;

    if (!recipientId || !subject || !message) {
      return res.status(400).json({ error: "Recipient, subject, and message are required." });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found." });
    }


    await new Notification({
      user: recipient.id,
      title: subject,
      message,
      type,
      createdBy: senderId,
    }).save();


    await new Message({
      sender: senderId,
      recipient: recipient.id,
      subject,
      body: message,
      attachment: file ? {
        filename: file.originalname,
        path: file.path,
      } : undefined,
    }).save();


    const emailHtml = `
      <p>Hello ${recipient.name || "User"},</p>
      <p><strong>${subject}</strong></p>
      <p>${message}</p>
    `;

    const attachments = file ? [{
      filename: file.originalname,
      path: file.path,
    }] : [];

    await sendEmail(recipient.email, subject, emailHtml, attachments);


    if (file) {
      fs.unlink(file.path, err => {
        if (err) console.error("File cleanup error:", err);
      });
    }

    res.status(200).json({ message: "Message sent successfully." });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});




export const getSentMessages = catchAsyncErrors(async (req, res) => {
  try {
    const sent = await Message.find({ sender: req.user.id })
      .sort({ createdAt: -1 })
      .populate('recipient', 'name email');

    res.status(200).json({ messages: sent });
  } catch (error) {
    console.error("Sent error:", error);
    res.status(500).json({ error: "Failed to load sent messages." });
  }
});


export const markMessageAsRead = catchAsyncErrors(async (req, res) => {
  const messageId = req.params.id;
  const message = await Message.findById(messageId);

  if (!message) return res.status(404).json({ error: "Message not found" });

  if (message.recipient.toString() !== req.user.id) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  message.read = true;
  await message.save();

  res.status(200).json({ message: "Message marked as read" });
});




//feedback 

export const submitFeedback = catchAsyncErrors(async (req, res, next) => {
  const { type, title, description } = req.body;

  try {
    if (!req.user || !req.user.id) {
      return next(new ErrorHandler("Unauthorized", 401));
    }
  
    if (!type || !title) {
      return next(new ErrorHandler("Type and Title are required", 400));
    }
  
    let attachment = null;
    if (req.file) {
      attachment = {
        url: req.file.path,        // cloudinary file URL
        public_id: req.file.filename // Cloudinary public ID
      };
    }
  
    const feedback = await Feedback.create({
      user: req.user.id,
      type,
      title,
      description,
      attachment,
    });
  
    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully.",
      feedback,
    });
  } catch (error) {
     return next(new ErrorHandler(error.message, 400));
  }
});



export const getMyAttendance = catchAsyncErrors(async (req, res, next) => {
  const { month, year } = req.query;
try {
  
    if (!month || !year) {
      return next(new ErrorHandler("Month and year are required", 400));
    }
  
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
  
    const records = await Attendance.find({
      employee: req.user.id,
      date: { $gte: start, $lte: end }
    });
  
    let present = 0, absent = 0, late = 0, wfh = 0, totalHours = 0;
  
    records.forEach(record => {
      switch (record.status) {
        case "Present": present++; break;
        case "Absent": absent++; break;
        case "Late": late++; break;
        case "Work From Home": wfh++; break;
      }
      totalHours += record.workingHours;
    });
  
    res.status(200).json({
      success: true,
      summary: {
        present,
        absent,
        late,
        workFromHome: wfh,
        totalWorkingHours: totalHours
      }
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





export const generatePayslip = catchAsyncErrors(async (req, res, next) => {
  try {
    const { employeeId, month, year } = req.query;

    const employee = await Employee.findById(employeeId).lean();
    if (!employee) return next(new ErrorHandler('Employee not found', 404));


    const attendanceRecords = await Attendance.find({
      employee: employeeId,
      date: {
        $gte: new Date(`${year}-${month}-01`),
        $lte: new Date(`${year}-${month}-31`)
      }
    }).lean();

    const presentDays = attendanceRecords.filter(a => a.status === 'Present').length;
    const leaveDays = attendanceRecords.filter(a => a.status === 'Leave').length;
    const absentDays = attendanceRecords.filter(a => a.status === 'Absent').length;
    const totalWorkingDays = presentDays + leaveDays + absentDays;


    const salary = await Salary.findOne({ employee: employeeId }).lean();
    if (!salary) return next(new ErrorHandler('Salary details not found', 404));


    const grossSalary = salary.basic + salary.hra + salary.specialAllowance + salary.medicalAllowance;
    const totalDeductions = salary.tds + salary.pf + salary.professionalTax;
    const netSalary = grossSalary - totalDeductions;


    const payslip = {
      company: {
        name: "NovaNectar Private Limited",
        gst: "27AABCU9603R1ZX"
      },
      employee: {
        name: employee.fullName,
        id: employee.employeeId,
        designation: employee.designation,
        department: employee.department
      },
      payment: {
        payPeriod: `${monthNames[month - 1]} ${year}`,
        paymentDate: "7 " + monthNames[month - 1] + " " + year,
        bankAccount: employee.bankAccount,
        pan: employee.pan
      },
      attendance: {
        presentDays,
        leaveDays,
        absentDays,
        totalWorkingDays,
        holidays: 7,
        attendancePercent: Math.round((presentDays + leaveDays) / totalWorkingDays * 100)
      },
      earnings: {
        basic: salary.basic,
        hra: salary.hra,
        specialAllowance: salary.specialAllowance,
        medicalAllowance: salary.medicalAllowance,
        grossSalary
      },
      deductions: {
        tds: salary.tds,
        pf: salary.pf,
        professionalTax: salary.professionalTax,
        totalDeductions
      },
      netSalary,
      netSalaryWords: numberToWords(netSalary)
    };

    res.status(200).json({ success: true, payslip });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});



const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];


function numberToWords(num) {
 
  return "Fourteen Thousand Three Hundred Twenty rupees only"; 
}
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import Employee from "../models/employee.model.js";
import Leave from "../models/leave.model.js";
import User from "../models/user.model.js";
import { generateAccessAndRefreshTokens } from "../util/jwtToken.js";
import { nanoid } from "nanoid";
import { sendNotification } from "../util/notification.js";
import cloudinary from "../config/cloudinary.js";
import Document from "../models/document.model.js";
import Salary from "../models/salary.model.js";
import BankAccount from "../models/banckAccount.model.js";
import Department from "../models/department.model.js";
import Position from "../models/position.model.js";


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

// export const addEmployee = catchAsyncErrors(async (req, res, next) => {
//   const { fullName, email, department, position, phone, ...rest } = req.body;

//   try {
//     const existing = await User.findOne({ email });
//     if (existing) return next(new ErrorHandler("User already exists", 402));

//     const password = "emp@123";
//     const employeeId = `EMP${nanoid(6).toUpperCase()}`;

//     const user = await User.create({
//       email,
//       password,
//       role: "employee",
//     });

//     const profile = await Employee.create({
//       user: user._id,
//       employeeId,
//       fullName,
//       department,
//       position,
//       phone,
//       ...rest,
//     });


//       await sendNotification({
//       userId: user._id,
//       title: "Welcome to the Team!",
//       message: `Welcome aboard, ${fullName}! We're excited to have you join as a ${position}.`,
//       type: "Employee",
//       createdBy: req.user?.id || null, 
//     });

//     res.status(201).json({
//       message: "Employee created by HR",
//       user: user._id,
//       profile,
//     });
//   } catch (error) {
//     return next(new ErrorHandler(error.message, 500));
//   }
// });

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
    message: `Your leave request from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been ${leave.status
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



//approve document update request
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


  await document.save();

  await sendNotification({
    userId: document.user.id,
    title: "Your Document Request",
    message: `Your document request was submitted successfully with status: ${document.status}.`,
    type: "document",
    createdBy: req.user.id,
  });

  res.status(200).json({
    success: true,
    message: "Document update approved",
    document
  });
});

//approve document delete request
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


export const getInboxMessages = async (req, res) => {
  try {
    const inbox = await Message.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .populate('sender', 'name email');

    res.status(200).json({ messages: inbox });
  } catch (error) {
    console.error("Inbox error:", error);
    res.status(500).json({ error: "Failed to load inbox." });
  }
};

export const addEmployee = catchAsyncErrors(async (req, res, next) => {
  const {
    fullName, employeeId, email, contactNo, emgContactName, emgContactNo, joinedOn, department, position, currentAddress, permanentAddress, bio,
    //bank details
    bankName, accountNumber, ifscCode,
    //salary details
    basic, salaryCycle, allowances, deductions, netSalary
  } = req.body

  //bio and deductions are optional
  if (
    !fullName || !employeeId || !email || !contactNo || !emgContactName || !emgContactNo ||
    !joinedOn || !department || !position || !currentAddress || !permanentAddress ||
    !bankName || !accountNumber || !ifscCode ||
    !basic || !salaryCycle || !allowances || !netSalary
  ) {
    return next(new ErrorHandler("Please provide all required fields.", 400));
  }

  //chk existing user and employee
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("User already exists with this email", 400));
  }

  const existingEmployee = await Employee.findOne({ employeeId });
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

  const user = await User.create({
    email,
    password: employeeId,
    role: 'employee'
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

  const requiredDocTypes = ['empIdProof', 'empPhoto', 'emp10PassCert', 'emp12PassCert', 'empGradCert', 'empExpCert']

  const missingDocs = requiredDocTypes.filter(type => !req.files[type] || req.files[type].length === 0);
  if (missingDocs.length > 0) {
    return next(new ErrorHandler(`Please upload all required documents.Missing Document(s): ${missingDocs.join(', ')}`, 400));
  }

  const documents = []

  for (const field in req.files) { //req.files obj
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

  const employee = await Employee.create({
    user: user._id,
    employeeId,
    fullName,
    contactNo,
    emergencyContact: {
      name: emgContactName,
      phone: emgContactNo
    },
    department: existingDepartment._id,
    position: existingPosition._id,
    currentAddress,
    permanentAddress,
    bio,
    joinedOn,
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

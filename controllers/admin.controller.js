import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import Employee from "../models/employee/employee.model.js";
import Leave from "../models/leave/leave.model.js";
import User from "../models/user.model.js";
import { generateAccessAndRefreshTokens } from "../util/jwtToken.js";
import { sendNotification } from "../util/notification.js";
import cloudinary from "../config/cloudinary.js";
import Document, { DOCUMENT_TYPE_ENUM } from "../models/employee/document.model.js";
import Feedback from "../models/others/feedback.model.js";
import Meeting from "../models/meeting/meeting.model.js";
import Salary from "../models/payroll/salary.model.js";
import BankAccount from "../models/payroll/banckAccount.model.js";
import Department from "../models/employee/department.model.js";
import Position from "../models/employee/position.model.js";
import MeetingType from "../models/meeting/meetingType.model.js";
import EmpIdConfig from "../models/employee/empIdConfig.model.js";
import ReviewCycleConfig from "../models/performance/reviewCycleConfig.model.js";
import TaskScoreConfig from "../models/performance/taskScoreConfig.model.js";
import PerfMetricsConfig from "../models/performance/perfMetricsConfig.model.js";
import StandardWorkingHour from "../models/attendance/standardWorkingHour.model.js";
import Performance from "../models/performance/performance.model.js";
import Attendance from "../models/attendance/attendance.model.js";
import Payslip from "../models/payslip.model.js";
import LeaveType from "../models/leave/leaveType.model.js";
import Settings from "../models/setting.model.js";

//------auth related controllers------//


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

      res.cookie("accessToken", accessToken, {
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















export const getInboxMessages = catchAsyncErrors(async (req, res) => {
  try {
    const inbox = await Message.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .populate('sender', 'name email');

    res.status(200).json({ messages: inbox });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});


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
  const { name, type, date, startTime, endTime, description } = req.body;

  if (!name || !type || !date || !startTime || !endTime) {
    return next(new ErrorHandler("Missing required fields", 400));
  }

  // Validate date & times
  const dt = new Date(`${date}T${startTime}:00`);
  const dtEnd = new Date(`${date}T${endTime}:00`);
  if (dtEnd <= dt) {
    return next(new ErrorHandler("End time must be after start time", 400));
  }

  // Validate type value
  if (!["Meeting","Event"].includes(type)) {
    return next(new ErrorHandler("Invalid type. Must be 'Meeting' or 'Event'.", 400));
  }

  const meetingTypeDoc = await MeetingType.findOne({ name: type }).populate( 'name');
  if (!meetingTypeDoc) {
    return next(new ErrorHandler(`Type '${type}' does not exist`, 400));
  }

  let attendeeIds = [];
  if (type === "Meeting") {
    const users = await User.find({ role: 'employee' });
    attendeeIds = users.map(u => u._id);
  }

  const meeting = await Meeting.create({
    name,
    type: meetingTypeDoc._id,
    date,
    startTime,
    endTime,
    description,
    createdBy: req.user.id,
    attendees: attendeeIds,
  });

  if (attendeeIds.length) {
    const notifications = attendeeIds.map(userId => ({
      user: userId,
      title: `New ${type}: ${name}`,
      description: `Scheduled on ${date} from ${startTime} to ${endTime}`,
      type: type.toLowerCase(),
      createdBy: req.user.id
    }));
    await Notification.insertMany(notifications);
  }

  res.status(201).json({
    success: true,
    message: `${type} created successfully.`,
    meeting,
  });
});




export const getAllMeetings = catchAsyncErrors(async (req, res, next) => {
  const meetings = await Meeting.find()
    .populate({ path: "type", select: "name" }) // include type name
    .populate({ path: "createdBy", select: "name email" });

  res.status(200).json({
    success: true,
    count: meetings.length,
    meetings,
  });
});



export const deleteMeeting = catchAsyncErrors(async (req, res, next) => {
  const meetingId = req.params.id;

  const meeting = await Meeting.findById(meetingId);
  if (!meeting) {
    return next(new ErrorHandler("Meeting not found", 404));
  }

  await Meeting.findByIdAndDelete(meetingId);

  res.status(200).json({
    success: true,
    message: "Meeting deleted successfully",
  });
});






// controllers/dashboardController.js


export const getEmployeeStatsall = async (req, res) => {
  try {
    const result = await Employee.aggregate([
      {
        $group: {
          _id: "$position", 
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "positions", 
          localField: "_id",
          foreignField: "_id",
          as: "positionDetails",
        },
      },
      { $unwind: "$positionDetails" },
      {
        $project: {
          position: "$positionDetails.name",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    const totalEmployees = result.reduce((sum, item) => sum + item.count, 0);

    res.status(200).json({
      success: true,
      total: totalEmployees,
      positions: result, 
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};



export const getEmployeeStatus = catchAsyncErrors(async (req, res, next) => {
  const { filter } = req.query;


  const query = {};


  if (filter === "active") {
    query.status = "active";
  } else if (filter === "inactive") {
    query.status = "inactive";
  } else if (filter === "onLeave") {
    query["leaveDetails.0"] = { $exists: true }; 
  }

  const employees = await Employee.find(query)
    .populate("position", "name") 
    .select("employeeId fullName status position"); 

  const result = employees.map(emp => ({
    id: emp.employeeId,
    name: emp.fullName,
    position: emp.position?.name || "N/A",
    status: emp.status === "active"
      ? (emp.leaveDetails?.length ? "On Leave" : "Active")
      : "Inactive",
    attendance: "N/A", 
  }));

  res.status(200).json({
    success: true,
    total: result.length,
    employees: result,
  });
});



export const getEmployeesList = catchAsyncErrors(async (req, res) => {
  const employees = await Employee.find()
    .populate("position", "name")
    .populate("user", "_id role");

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const attendanceRecords = await Attendance.find({
    date: { $gte: startOfMonth, $lte: today },
  });

  const attendanceMap = {};
  for (const record of attendanceRecords) {
    const userId = record.user?.toString();
    if (!userId) continue;

    if (!attendanceMap[userId]) attendanceMap[userId] = 0;

    if (["Present", "Late", "Work From Home"].includes(record.status)) {
      attendanceMap[userId]++;
    }
  }

  const totalDays = Math.ceil((today - startOfMonth) / (1000 * 60 * 60 * 24)) + 1;

  const data = employees
    .map((emp) => {
      if (!emp.user || !emp.user._id) return null;

      const userId = emp.user._id.toString();
      const daysPresent = attendanceMap[userId] || 0;
      const attendancePercent = totalDays > 0
        ? Math.round((daysPresent / totalDays) * 100)
        : 0;

      return {
        id: emp.employeeId,
        name: emp.fullName,
        contact: emp.contactNo,
        jobRole: emp.position?.name || "N/A",
        attendance: `${attendancePercent}%`,
        type: mapType(emp.user?.role),
        status: emp.status === "active" ? "Active" : "Inactive",
      };
    })
    .filter(Boolean);

  res.status(200).json({
    success: true,
    total: data.length,
    employees: data,
  });
})
function mapType(role = "") {
  const r = role?.toLowerCase?.() || "";

  if (r === "employee") return "Work from office";
  if (r === "hr") return "Remote";
  return "Hybrid"; 
}


export const getEmployeeById = catchAsyncErrors(async (req, res) => {
  const emp = await Employee.findOne({ employeeId: req.params.id })
    .populate("position", "name")
    .populate("user", "email role")
    .populate("leaveDetails")
    .populate("salaryDetails") // etc. if needed

  if (!emp) return next(new ErrorHandler("Employee not found", 404));

  // Also fetch attendance summary if needed
  const attendanceStats = await calculateAttendanceSummary(emp.user._id);

  res.status(200).json({
    success: true,
    employee: {
      id: emp.employeeId,
      fullName: emp.fullName,
      email: emp.user.email,
      phone: emp.contactNo,
      position: emp.position?.name,
      status: emp.status,
      joiningDate: emp.joinedOn,
      emergencyContact: emp.emergencyContact,
      address: emp.currentAddress,
      bio: emp.bio,
      documents: transformDocuments(emp.documents),
      attendanceSummary: attendanceStats,
      leaveStats: calculateLeaveStats(emp.leaveDetails),
     
    },
  });
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





export const getLeavesWithEmployeeName = catchAsyncErrors(async (req, res, next) => {
  const leaves = await Leave.find()
    .populate({
      path: 'user',
      populate: {
        path: 'user',
        model: 'User',
        select: 'email role',
      },
    })
    .populate({
      path: 'leaveType',
      select: 'name',
    })
    .lean();

  const formattedLeaves = leaves.map((leave) => {
    const employee = leave.user;
    const userInfo = employee?.user;

    return {
      id: leave._id,
      name: employee?.fullName || 'N/A',
      leaveType: leave.leaveType?.name || 'N/A',
      from: leave.startDate,
      to: leave.endDate,
      duration: leave.durationInDays || 'N/A',
      status: leave.status,
    };
  });

  res.status(200).json({
    success: true,
    count: formattedLeaves.length,
    leaves: formattedLeaves,
  });
});


export const getAllEmployeeAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

   
    const employees = await Employee.find()
      .populate({
        path: "position",
        model: "Position",
        select: "name"
      })
      .populate({
        path: "user",
        model: "User",
        select: "_id"
      });


    const attendanceRecords = await Attendance.find({
      date: { $gte: today, $lt: tomorrow },
    });

  
    const attendanceMap = new Map();
    attendanceRecords.forEach(att => {
      attendanceMap.set(att.user.toString(), att);
    });


    const finalData = employees.map(emp => {
      const userId = emp.user?._id?.toString();
      const attendance = attendanceMap.get(userId);

      return {
        id: emp.employeeId,
        name: emp.fullName,
        role: emp.position?.name || "N/A",
        checkIn: attendance?.punchIn || "------",
        checkOut: attendance?.punchOut || "------",
        status: attendance?.status || "Absent"
      };
    });

    res.status(200).json(finalData);
  } catch (error) {
    console.error("Error fetching attendance:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};



export const getAttendanceByFilter = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const attendance = await Attendance.find({ date });
    res.json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};





export const reviewLeave = catchAsyncErrors(async (req, res, next) => {
  const { leaveId } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  // Validate status
  const allowedStatuses = ["Approved", "Rejected"];
  if (!allowedStatuses.includes(status)) {
    return next(
      new ErrorHandler(
        `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
        400
      )
    );
  }

  // Find leave request
  const leave = await Leave.findById(leaveId).populate("user");
  if (!leave) {
    return next(new ErrorHandler("Leave request not found", 404));
  }
  console.log("leaveId:", leaveId);

  // Check if already reviewed
  if (leave.status !== "Pending") {
    return next(new ErrorHandler("Leave request is already reviewed", 400));
  }

  // Update leave status
  leave.status = status;
  leave.reviewedBy = userId;
  leave.reviewedAt = new Date();

  await leave.save();

  // Send notification to user
  await sendNotification({
    userId: leave.user._id,
    title: "Leave Request Update",
    message: `Your leave request from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been ${status}.`,
    type: "Leave",
    createdBy: userId,
  });

  res.status(200).json({
    success: true,
    message: `Leave request ${status.toLowerCase()} successfully`,
    leave,
  });
});

export const getLeaveTypeNamesEnum = (req, res) => {
  const leaveTypeNameEnum = LeaveType.schema.path('name').enumValues;
  res.status(200).json({ leaveTypeNames: leaveTypeNameEnum });
};

// GET /employees
export const getEmployees = catchAsyncErrors(async (req, res, next) => {
  const employees = await Employee.find({});
  if (!employees) {
    return next(new ErrorHandler('No employees found', 404));
  }
  res.status(200).json({ employees });
});








export const createLeaveByAdmin = catchAsyncErrors(async (req, res, next) => {
  const {
    fullName,
    leaveType,   // This will be the name, e.g. "Sick Leave"
    startDate,
    endDate,
    reason,
    comment,
  } = req.body;

  if (!fullName || !leaveType || !startDate || !endDate || !reason) {
    return next(new ErrorHandler("Please fill all required fields", 400));
  }

  // Find employee by fullName (trimmed)
  const employee = await Employee.findOne({ fullName: fullName.trim() });
  if (!employee) {
    return next(new ErrorHandler("Employee not found", 404));
  }

  // Find LeaveType by name (case-insensitive)
  const leaveTypeDoc = await LeaveType.findOne({
    name: { $regex: `^${leaveType.trim()}$`, $options: 'i' }
  });
  if (!leaveTypeDoc) {
    return next(new ErrorHandler("Leave type not found", 404));
  }

  // Parse date strings "dd-mm-yyyy" into JS Date objects
  const parseDate = (dateStr) => {
    const [dd, mm, yyyy] = dateStr.split("-");
    return new Date(`${yyyy}-${mm}-${dd}`);
  };

  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (start > end) {
    return next(new ErrorHandler("Start date cannot be after end date", 400));
  }

  const durationInDays = ((end - start) / (1000 * 60 * 60 * 24)) + 1;

  // Create leave
  const leave = await Leave.create({
    user: employee._id,
    leaveType: leaveTypeDoc._id,
    startDate: start,
    endDate: end,
    reason,
    comment,
    durationInDays: durationInDays.toString(),
    status: "Approved",
  });

  // Populate leaveType with its details (including name)
  const populatedLeave = await leave.populate('leaveType', 'name type totalLeaveDays').execPopulate();

  res.status(201).json({
    success: true,
    message: "Leave request submitted successfully by Admin/HR.",
    leave: populatedLeave,
  });
});






export const generatePayrollTable = catchAsyncErrors(async (req, res, next) => {
  let { month, year } = req.query;


  month = parseInt(month);
  year = parseInt(year);
  if (!month || month < 1 || month > 12 || !year || year < 2000) {
    return res.status(400).json({ success: false, message: "Invalid month or year" });
  }
});

export const editAttendence = catchAsyncErrors(async (req, res, next) => {
  const loggedInUserId = req.user.id
  const { attId } = req.params
  const { date, status, punchInTime, punchOutTime, locationType, notes } = req.body;

  const attendance = await Attendance.findById(attId)
  if (!attendance) {
    return next(new ErrorHandler("Attendance record not found", 404));
  }

  attendance.date = date ? new Date(date) : attendance.date
  attendance.punchInDate = punchInTime ? new Date(`${date}T${punchInTime}`) : attendance.punchInDate
  attendance.punchOutDate = punchOutTime ? new Date(`${date}T${punchOutTime}`) : attendance.punchOutDate

  attendance.status = status ?? attendance.status
  attendance.locationType = locationType ?? attendance.locationType
  attendance.notes = notes ?? attendance.notes
  attendance.updatedBy = loggedInUserId

  await attendance.save();

  res.status(200).json({
    success: true,
    message: "Attendance updated successfully",
    attendance,
  })
})


//------performance related controllers------//
// export const getAllEmployeePerformance = catchAsyncErrors(async (req, res, next) => {
//   try {

//     const employees = await Employee.find();


//     const results = await Promise.all(
//       employees.map(async (emp) => {
//         const evaluation = await PerformanceEvaluation.findOne({ employee: emp._id })
//           .sort({ updatedAt: -1 })
//           .lean();

//         return {
//           employeeName: emp.fullName,
//           position: emp.position,
//           performanceScore: evaluation ? evaluation.performanceScore : null,
//           scores: evaluation ? evaluation.scores : null,
//           notes: evaluation ? evaluation.notes : null,
//           lastUpdated: evaluation ? evaluation.updatedAt : null,
//           employeeId: emp._id,
//         };
//       })
//     );

//     res.status(200).json({ success: true, data: results });
//   } catch (error) {
//     return next(new ErrorHandler(error.message, 400));
//   }
// });

// export const saveEvaluation = async (req, res, next) => {
//   try {
//     const { employeeId } = req.params;
//     const evaluatorId = req.user.id;
//     const { workQuality, productivity, reliability, teamwork, innovation, notes } = req.body;

//     const performanceScore = (
//       (workQuality + productivity + reliability + teamwork + innovation) / 5
//     ).toFixed(2);


//     let evaluation = await PerformanceEvaluation.findOne({ employee: employeeId, });

//     if (evaluation) {

//       evaluation.scores = { workQuality, productivity, reliability, teamwork, innovation };
//       evaluation.notes = notes;
//       evaluation.performanceScore = performanceScore;
//       await evaluation.save();
//     } else {

//       evaluation = await PerformanceEvaluation.create({
//         employee: employeeId,
//         evaluator: evaluatorId,
//         scores: { workQuality, productivity, reliability, teamwork, innovation },
//         notes,
//         performanceScore,
//       });
//     }

//     res.status(200).json({ success: true, evaluation });
//   } catch (error) {
//     return next(new ErrorHandler(error.message, 400));
//   }
// };

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
});


export const getAllPerformance = catchAsyncErrors(async (req, res) => {
  const employees = await Employee.find().populate("position").lean();
  const performanceRecords = await Performance.find().lean();

  const perfMap = new Map(performanceRecords.map(r => [r.employee.toString(), r]));

  const data = employees.map(emp => ({
    id: emp._id.toString(),
    fullName: emp.fullName,
    position: emp.position?.title || "Employee",
    performance: perfMap.has(emp._id.toString())
      ? {
          ...perfMap.get(emp._id.toString()),
          average: perfMap.get(emp._id.toString()).performanceScore
        }
      : null,
  }));

  res.status(200).json({ success: true, data });
});






export const savePerformance = catchAsyncErrors(async (req, res) => {
  const { employeeId } = req.params;
  const { workQuality, productivity, reliability, teamwork, innovation, notes, average, evaluator } = req.body;

  if (!evaluator) {
    return res.status(400).json({ success: false, message: "Evaluator is required." });
  }

  let record = await Performance.findOne({ employee: employeeId });

  if (record) {
    record.workQuality = workQuality;
    record.productivity = productivity;
    record.reliability = reliability;
    record.teamwork = teamwork;
    record.innovation = innovation;
    record.notes = notes;
    record.performanceScore = average;
    record.evaluator = evaluator;   // <== add this
    record.updatedAt = Date.now();
    await record.save();
  } else {
    record = await Performance.create({
      employee: employeeId,
      workQuality,
      productivity,
      reliability,
      teamwork,
      innovation,
      notes,
      performanceScore: average,
      evaluator,   // <== add this
    });
  }

  res.status(200).json({ success: true, performance: record.toObject() });
});











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




//------employee related controllers------//
//------add employee related controllers------//


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
    !fullName || !email || !contactNo || !emgContactName || !emgContactNo ||
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
    employeeId: finalEmployeeId,
    fullName,
    contactNo,
    emergencyContact: {
      name: emgContactName,
      phone: emgContactNo
    },
    department: existingDepartment,
    position: existingPosition,
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
});


export const getDepartments = catchAsyncErrors(async (req, res, next) => {
  const departments = await Department.find().sort({ name: 1 }); // Sort alphabetically

  res.status(200).json({
    success: true,
    departments,
  });
});





export const deleteDepartment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;  

  if (!id) {
    return next(new ErrorHandler("Department ID is required", 400));
  }

  const department = await Department.findById(id);
  if (!department) {
    return next(new ErrorHandler("Department not found", 404));
  }

  await Employee.updateMany(
    { department: id },
    { $set: { department: null } }
  );

  
  await Department.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Department deleted successfully and all employees' departments set to null"
  });
});








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
  let config = await PerfMetricsConfig.findOne();

  if (!config) {
    config = await PerfMetricsConfig.create({
      metrics: performance.map((name) => ({ name, enabled: false })),
    });
  }

  res.status(200).json({ success: true, perfMetricConfig: config });
});


export const setPerfMetricsConfig = catchAsyncErrors(async (req, res, next) => {
  const { metrics } = req.body;

  if (!Array.isArray(metrics)) {
    return next(new ErrorHandler("Invalid metrics format", 400));
  }

  let config = await PerfMetricsConfig.findOne();
  if (!config) {
    config = await PerfMetricsConfig.create({ metrics });
  } else {
    config.metrics = metrics;
    await config.save();
  }

  res.status(200).json({
    success: true,
    message: "Performance metrics updated",
    perfMetricConfig: config,
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





export const getAllLeaveTypes = catchAsyncErrors(async (req, res, next) => {
  const leaveTypes = await LeaveType.find();
  res.status(200).json({
      success: true,
      leaveTypes, 
    });
});




export const createLeaveType = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    type,
    totalLeaveDays,
    frequency,
    enabledCarryForward,
    enabledRequireApproval,
    color,
    createdBy
  } = req.body;

  const leaveType = await LeaveType.create({
    name,
    type,
    totalLeaveDays,
    frequency,
    enabledCarryForward,
    enabledRequireApproval,
    color,
    createdBy
  });

  res.status(201).json({
    success: true,
    message: "Leave type created successfully",
    leaveType
  });
});


export const updateLeaveType = catchAsyncErrors(async (req, res, next) => {
  let leaveType = await LeaveType.findById(req.params.id);

  if (!leaveType) {
    return next(new ErrorHandler("Leave type not found", 404));
  }

  leaveType = await LeaveType.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: "Leave type updated successfully",
    leaveType
  });
});





export const updateCarryForwardRules = catchAsyncErrors(async (req, res, next) => {
  const { leaveTypeId } = req.params;

  const {
    enabledCarryForward,
    maxCarryForwardDays,
    validityOfCarriedLeaves, // { unit: 'monthly', value: 6 }
    cycleReset
  } = req.body;

  const leaveType = await LeaveType.findById(leaveTypeId);

  if (!leaveType) {
    return res.status(404).json({
      success: false,
      message: "Leave type not found"
    });
  }

  // Update fields
  leaveType.enabledCarryForward = enabledCarryForward ?? leaveType.enabledCarryForward;
  leaveType.maxCarryForwardDays = maxCarryForwardDays ?? leaveType.maxCarryForwardDays;
  leaveType.validityOfCarriedLeaves = validityOfCarriedLeaves ?? leaveType.validityOfCarriedLeaves;
  leaveType.cycleReset = cycleReset ?? leaveType.cycleReset;

  await leaveType.save();

  res.status(200).json({
    success: true,
    message: "Carry forward rules updated successfully",
    leaveType
  });
});



export const updateLeaveRules = catchAsyncErrors(async (req, res, next) => {
  const { leaveTypeId } = req.params;

  const {
    minimumAdvanceNotice,
    maximumConsecutiveDays,
    blockWeekends,
    blockHolidays,
  } = req.body;

  const leaveType = await LeaveType.findById(leaveTypeId);

  if (!leaveType) {
    return res.status(404).json({
      success: false,
      message: "Leave type not found",
    });
  }

  leaveType.leaveRules = {
    minimumAdvanceNotice,
    maximumConsecutiveDays,
    blockWeekends,
    blockHolidays,
  };

  await leaveType.save();

  res.status(200).json({
    success: true,
    message: "Leave rules updated successfully",
    leaveType,
  });
});
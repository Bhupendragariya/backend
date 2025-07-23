
import { nanoid } from "nanoid";
import User from "../models/user.model.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import Employee from "../models/employee.model.js";
import Leave from "../models/leave.model.js";
import cloudinary from "../config/cloudinary.js";
import Document from "../models/document.model.js";
import Feedback from "../models/feedback.model.js";
import Meeting from "../models/meeting.model.js";
import Payslip from "../models/payslip.model.js";
import Attendance from "../models/attendance.model.js";
import Settings from "../models/setting.model.js";



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


      await sendNotification({
  userId: user.id,
  title: "add a employee",
  message: `welcome to ${profile.fullName}`,
  type: "welcome",
  createdBy: req.user.id, 
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
  userId: leave.user.id,
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





//document
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



export const getInboxMessages = catchAsyncErrors( async (req, res) => {
  try {
    const inbox = await Message.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .populate('sender', 'name email');

    res.status(200).json({ messages: inbox });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});



export const markFeedbackAsRead = catchAsyncErrors( async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ error: 'Feedback not found' });

    feedback.status = 'read';
    await feedback.save();

    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (err) {
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
  } catch (err) {
    return next(new ErrorHandler(error.message, 400));
  }
});


export const getAllFeedbackMessages =catchAsyncErrors(async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'name email') 
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      feedbacks,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});



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
 
 
   const meeting = await Meeting.create({
     name,
     type,
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



export const createLeaveByAdmin = catchAsyncErrors(async (req, res, next) => {
  const {
    employeeId,   
    leaveType,
    startDate,    
    endDate,      
    reason,
    comment
  } = req.body;
try {
  
    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
      return next(new ErrorHandler("Please fill all required fields", 400));
    }
  
   
    const employee = await User.findById(employeeId);
    if (!employee) {
      return next(new ErrorHandler("Employee not found", 404));
    }
  
   
    const toDate = (dateStr) => {
      const [dd, mm, yy] = dateStr.split("-");
      return new Date(`20${yy}-${mm}-${dd}`);
    };
  
    const leave = await Leave.create({
      user: employeeId,
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



export const getAllEmployeePerformance =  catchAsyncErrors(async (req, res, next) => {
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





export const getSinglePayslip = catchAsyncErrors(async (req, res, next) => {
  const payslipId = req.params.id;

 try {
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
 } catch (error) {
   return next(new ErrorHandler(error.message, 400));
 }
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

try {
  
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
        payslipId: payslip.id,
        month: payslip.month,
        year: payslip.year
      };
    });
  
    res.status(200).json({
      success: true,
      employees: formatted
    });
} catch (error) {
   return next(new ErrorHandler(error.message, 400));
}

   
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




export const getGeneralSettings = catchAsyncErrors(async (req, res, next) => {
  const settings = await Settings.findOne().lean();
  if (!settings) return next(new ErrorHandler('Settings not found', 404));
  res.status(200).json({ success: true, data: settings });
});


export const saveGeneralSettings = catchAsyncErrors(async (req, res, next) => {
  const {
    company,
    systemDefaults,
    preferences
  } = req.body;

  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({ company, systemDefaults, preferences });
  } else {
    settings.company = company;
    settings.systemDefaults = systemDefaults;
    settings.preferences = preferences;
    await settings.save();
  }
  res.status(200).json({ success: true, message: "Settings saved successfully", data: settings });
});



export const updateSystemDefaults = catchAsyncErrors(async (req, res, next) => {

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ systemDefaults: req.body });
    } else {
      settings.systemDefaults = req.body;
    }
    await settings.save();
    res.status(200).json({ success: true, message: "System defaults updated", data: settings.systemDefaults });

  
});




export const getPreferences = catchAsyncErrors(async (req, res, next) => {
  try {
    const settings = await Settings.findOne().lean();
    if (!settings || !settings.preferences) {
      return res.status(404).json({ error: "Preferences not found" });
    }
    res.status(200).json({ success: true, data: settings.preferences });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export const updatePreferences =catchAsyncErrors(async (req, res, next) => {

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ preferences: req.body });
    } else {
      settings.preferences = req.body;
    }
    await settings.save();
    res.status(200).json({ success: true, message: "Preferences updated", data: settings.preferences });
 
});


export const getAttendanceSettings = catchAsyncErrors(async (req, res, next) => {

    const settings = await Attendance.findOne().lean();
    if (!settings) {
      return res.status(404).json({ error: 'Attendance settings not found' });
    }
    res.status(200).json({ success: true, data: settings });

});


export const updateAttendanceSettings = catchAsyncErrors(async (req, res, next) => {

    const { checkInBufferTime, checkOutBufferTime, lateMarkThreshold, halfDayThreshold } = req.body;

    let settings = await Attendance.findOne();
    if (!settings) {
      settings = new AttendanceSettings({ checkInBufferTime, checkOutBufferTime, lateMarkThreshold, halfDayThreshold });
    } else {
      settings.checkInBufferTime = checkInBufferTime;
      settings.checkOutBufferTime = checkOutBufferTime;
      settings.lateMarkThreshold = lateMarkThreshold;
      settings.halfDayThreshold = halfDayThreshold;
    }

    await settings.save();
    res.status(200).json({ success: true, message: 'Attendance settings updated', data: settings });
  
});


export const getWeekendDays = async (req, res) => {

    let settings = await Settings.findOne();

    if (!settings) {
    
      settings = await Settings.create({
        workConfig: { weekendDays: ['Saturday', 'Sunday'] }
      });
    }

    res.json({
      weekendDays: settings.workConfig.weekendDays
    });


};



export const updateWeekendDays = catchAsyncErrors(async (req, res) => {

    const { weekendDays } = req.body;

    if (!Array.isArray(weekendDays)) {
      return res.status(400).json({ error: "weekendDays must be an array" });
    }

    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      { 'workConfig.weekendDays': weekendDays },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Weekend days updated successfully',
      weekendDays: updatedSettings.workConfig.weekendDays
    });

});



export const getLocationSettings = catchAsyncErrors(async (req, res) => {

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    res.json({
      locationTracking: settings.locationTracking
    });

 
});

export const updateLocationSettings = catchAsyncErrors(async (req, res) => {

    const { gpsTrackingEnabled, restrictByLocation, allowedRadiusMeters } = req.body;

    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      {
        locationTracking: {
          gpsTrackingEnabled,
          restrictByLocation,
          allowedRadiusMeters,
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Location settings updated successfully',
      locationTracking: updatedSettings.locationTracking
    });


});



export const getAttendanceRules =catchAsyncErrors( async (req, res , next) => {

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    res.json({
      attendanceRules: settings.attendanceRules
    });

});


export const updateAttendanceRules = catchAsyncErrors(async (req, res) => {

    const {
      autoMarkAbsent,
      autoAbsentAfterHours,
      autoCheckout
    } = req.body;

    if (autoMarkAbsent && (!autoAbsentAfterHours || autoAbsentAfterHours <= 0)) {
      return next ( new ErrorHandler("autoAbsentAfterHours must be > 0 if autoMarkAbsent is enabled." , 400));
    }

    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      {
        attendanceRules: {
          autoMarkAbsent,
          autoAbsentAfterHours,
          autoCheckout
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      message: "Attendance rules updated successfully",
      attendanceRules: updatedSettings.attendanceRules
    });

});
import { Router } from "express";
import {
  addDepartment,
  addEmployee,
  addMeetingType,
  addPosition,
  approveOrRejectDeleteRequest,
  approveOrRejectUpdateRequest,
  createMeeting,
  createLeaveByAdmin,

  deleteDepartment,
  deleteMeetingType,
  deletePosition,
  editAttendence,
  getAllDepartments,
  getAllMeetingTypes,
  getAllPositions,
  getEmpIdConfig,
  getEmployeePerformance,
  getInboxMessages,
 
  getPerfMetricsConfig,
  getReviewCycleConfig,
  getStandardWorkingHour,
  getTaskScoreConfig,
  getSinglePayslip,
  getUnreadFeedbackCount,
  loginUser,
  markFeedbackAsRead,
  registerUser,
  reviewLeave,

  setEmpIdConfig,
  saveGeneralSettings,
  getSettings,
  updateSettings,
  logoutAdmin,
  updatePayrollSettings,
  setPerfMetricsConfig,
  setReviewCycleConfig,
  setStandardWorkingHour,
  setTaskScoreConfig,
  refreshAccessToken,
  getAllMeetings,
  deleteMeeting,
  getEmployeeStatus,
  getEmployeesList,
  getEmployeeById,
  getEmployeeStatsall,
  getAllEmployeeAttendance,
  getAttendanceByFilter,
  generatePayrollTable,
  // markSalaryAsPaid,
  // getPerformanceEvaluations,
  savePerformance,
  getAllPerformance,
  getAllFeedbackMessages,
  getAllEmployeeCards,
  getLeavesWithEmployeeName,
  getDepartments,
  getEmployees,
  getLeaveTypeNamesEnum,
 
} from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";





const router = Router();

router.post("/registerUser", registerUser);

router.post("/login", loginUser);


router.post("/addEmployee",
  authenticate,
  authorize(["Admin"]),
  upload.fields([
    { name: 'empPhoto' }, { name: 'empIdProof' }, { name: 'emp10PassCert' }, { name: 'emp12PassCert' }, { name: 'empGradCert' }, { name: 'empExpCert' }
  ]),
  addEmployee);

router.put(
  "/editAttendence/:attId",
  authenticate,
  authorize(["admin"]),
  editAttendence
);

router.get(
  "/employees",
  authenticate,
  authorize(["Admin"]),
  getEmployees
)

router.get(
  "/leaveTypesenum",
  authenticate,
  authorize(["Admin"]),
  getLeaveTypeNamesEnum
)

router.get(
  "/leave-detailed",
  authenticate,
  authorize(["Admin"]),
  getLeavesWithEmployeeName
)


router.put(
  "/leaveApproveLeave/:leaveId",
  authenticate,
  authorize(["Admin"]),
  reviewLeave
);

router.put(
  "/documentUpdateRequest/:docId",
  authenticate,
  authorize(["Admin"]),
  approveOrRejectDeleteRequest,
);


  

router.delete(
  "/documentDeleteRequest/:docId",
  authenticate,
  authorize(["Admin"]),
 approveOrRejectUpdateRequest,
);

router.get(
  '/messages/inbox',
  authenticate,
  authorize(["Admin"]),
  getInboxMessages
);



router.get(
  "/feedbackRead",
  authenticate,
  authorize(["Admin"]),
  markFeedbackAsRead
);

router.get(
  "/UnreadFeedbackCount",
  authenticate,
  authorize(["Admin"]),
  getUnreadFeedbackCount
);

router.get(
  "/AllFeedbackMessages",
  authenticate,
  authorize(["Admin"]),
  getAllFeedbackMessages
);



router.get(
  "/getSinglePayslip",
  authenticate,
  authorize(["Admin"]),
  getSinglePayslip
);

router.get(
  "/getAllEmployee",
  authenticate,
  authorize(["Admin"]),
  getAllEmployeeCards
);

router.post("/Meeting", authenticate, authorize(["Admin"]), createMeeting);

router.get("/allMeetings", authenticate, authorize(["Admin"]), getAllMeetings);

router.delete("/deleteMeting/:id", authenticate, authorize(["Admin"]), deleteMeeting);

router.get("/dashboard/employee-count", authenticate, authorize(["Admin"]), getEmployeeStatsall);


router.get("/getEmployeeStatus", authenticate, authorize(["Admin"]), getEmployeeStatus);


router.get("/getEmployeesList", authenticate, authorize(["Admin"]), getEmployeesList);


router.get("/employees/:id", authenticate, authorize(["Admin"]), getEmployeeById);

router.get("/getAllAttendance", authenticate, authorize(["Admin"]), getAllEmployeeAttendance);

router.get("/getAttendanceByFilter", authenticate, authorize(["Admin"]), getAttendanceByFilter);

router.get("/payroll", authenticate, authorize(["Admin"]), generatePayrollTable);

// router.get("/salaryAsPaid", authenticate, authorize(["Admin"]), markSalaryAsPaid);





router.post(
  "/createLeave",
  authenticate,
  authorize(["Admin"]),
  createLeaveByAdmin
);

router.get(
  "/getAllPerformance",
  authenticate,
  authorize(["Admin"]),
  getAllPerformance);


router.post(
  "/savePerformance/:employeeId",
  authenticate,
  authorize(["Admin"]),
  savePerformance);






// router.get(
//   "/performance",
//   authenticate,
//   authorize(["Admin"]),
//   getPerformanceEvaluations);


router.get(
  "/getAllDepartments",
  authenticate,
  authorize(["Admin"]),
  getAllDepartments
);

router.post(
  "/addDepartment",
  authenticate,
  authorize(["Admin"]),
  addDepartment
)


router.get(
  "/getDepartments",
  authenticate,
  authorize(["Admin"]),
  getDepartments
)

router.delete(
  "/deleteDepartment/:id",
  authenticate,
  authorize(["Admin"]),
  deleteDepartment
)

router.get(
  "/getAllPositions",
  authenticate,
  authorize(["Admin"]),
  getAllPositions
)

router.post(
  "/addPosition",
  authenticate,
  authorize(["Admin"]),
  addPosition
)

router.delete(
  "/deletePosition/:posId",
  authenticate,
  authorize(["Admin"]),
  deletePosition
)



router.get(
  "/getAllMeetingTypes",
  authenticate,
  authorize(["Admin"]),
  getAllMeetingTypes
)

router.post(
  "/addMeetingType",
  authenticate,
  authorize(["Admin"]),
  addMeetingType,
)

router.delete(
  "/deleteMeetingType/:typeId",
  authenticate,
  authorize(["Admin"]),
  deleteMeetingType
)

//emp settings
router.get(
  "/getEmpIdConfig",
  authenticate,
  authorize(["Admin"]),
  getEmpIdConfig
)

router.post(
  "/setEmpIdConfig",
  authenticate,
  authorize(["Admin"]),
  setEmpIdConfig
)

router.get(
  "/getStandardWorkingHour",
  authenticate,
  authorize(["Admin"]),
  getStandardWorkingHour
)

router.post(
  "/setStandardWorkingHour",
  authenticate,
  authorize(["Admin"]),
  setStandardWorkingHour
)

//perf settings
router.get(
  "/getReviewCycleConfig",
  authenticate,
  authorize(["Admin"]),
  getReviewCycleConfig
)

router.post(
  "/setReviewCycleConfig",
  authenticate,
  authorize(["Admin"]),
  setReviewCycleConfig
)

router.get(
  "/getTaskScoreConfig",
  authenticate,
  authorize(["Admin"]),
  getTaskScoreConfig
)

router.post(
  "/setTaskScoreConfig",
  authenticate,
  authorize(["Admin"]),
  setTaskScoreConfig
)

router.get(
  "/getPerfMetricsConfig",
  authenticate,
  authorize(["Admin"]),
  getPerfMetricsConfig
)

router.post(
  "/setPerfMetricsConfig",
  authenticate,
  authorize(["Admin"]),
  setPerfMetricsConfig
)

// router.post(
//   "/reviewPerformance/:empId",
//   authenticate,
//   authorize(['Admin']),
//   reviewPerformance
// )

router.get(
  "/getEmployeePerformance/:empId",
  authenticate,
  authorize(["Admin"]),
  getEmployeePerformance
)





router.get("/getSettings", authenticate, authorize(["Admin"]), getSettings)

router.patch('/save', authenticate, authorize(["Admin"]), saveGeneralSettings);

router.patch('/attendance-settings', authenticate, authorize(["Admin"]), updateSettings);


router.patch("/settings/payroll", authenticate, authorize(["Admin"]), updatePayrollSettings);

router.get("/refresh",  refreshAccessToken);



router.get("/logout", authenticate, authorize(["Admin"]), logoutAdmin);











export default router;




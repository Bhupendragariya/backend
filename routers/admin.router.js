import { Router } from "express";
import {
  addDepartment,
  addEmployee,
  addMeetingType,
  addPosition,
  approveDeleteRequest,
  approveUpdateRequest,
  createMeeting,
  createLeaveByAdmin,

  deleteDepartment,
  deleteMeetingType,
  deletePosition,
  getAllEmployeeCards,
  getAllEmployeePerformance,
  getAllFeedbackMessages,
  getAllDepartments,
  getAllMeetingTypes,
  getAllPositions,
  getEmpIdConfig,
  getEmployeePerformance,
  getInboxMessages,
  getLeavesWithEmployeeName,
  getPerfMetricsConfig,
  getReviewCycleConfig,
  getStandardWorkingHour,
  getTaskScoreConfig,
  getUserMeetings,
  getSinglePayslip,
  getUnreadFeedbackCount,
  loginUser,
  markFeedbackAsRead,
  registerUser,
  reviewLeave,
  reviewPerformance,
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
} from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";




const router = Router();

router.post("/registerUser", registerUser);

router.post("/loginUser", loginUser);


router.post("/addEmployee",
  authenticate,
  authorize(["admin"]),
  upload.fields([
    { name: 'empPhoto' }, { name: 'empIdProof' }, { name: 'emp10PassCert' }, { name: 'emp12PassCert' }, { name: 'empGradCert' }, { name: 'empExpCert' }
  ]),
  addEmployee);

router.get(
  "/leave-detailed",
  authenticate,
  authorize(["admin"]),
  getLeavesWithEmployeeName
);

router.put(
  "/leave-approveLeave/:leaveId",
  authenticate,
  authorize(["admin"]),
  reviewLeave
);

router.put(
  "/approveUpdateDocument/:docId",
  authenticate,
  authorize(["admin"]),
  approveUpdateRequest
);

router.delete(
  "/approveDeleteDocument/:docId",
  authenticate,
  authorize(["admin"]),
  approveDeleteRequest
);

router.get(
  '/messages/inbox',
  authenticate,
  authorize(["admin"]),
  getInboxMessages
);



router.get(
  "/feedbackRead",
  authenticate,
  authorize(["admin"]),
  markFeedbackAsRead
);

router.get(
  "/UnreadFeedbackCount",
  authenticate,
  authorize(["admin"]),
  getUnreadFeedbackCount
);

router.get(
  "/AllFeedbackMessages",
  authenticate,
  authorize(["admin"]),
  getAllFeedbackMessages
);


router.get(
  "/getSinglePayslip",
  authenticate,
  authorize(["admin"]),
  getSinglePayslip
);

router.get(
  "/getAllEmployee",
  authenticate,
  authorize(["admin"]),
  getAllEmployeeCards
);

router.post("/Meeting", authenticate, authorize(["admin"]), createMeeting);

router.get("/allMeetings", authenticate, authorize(["admin"]), getUserMeetings);

router.post(
  "/admin-create",
  authenticate,
  authorize(["admin"]),
  createLeaveByAdmin
);

router.get(
  "/getEmployeePerformance",
  authenticate,
  authorize(["admin"]),
  getAllEmployeePerformance);


router.get(
  "/getAllDepartments",
  authenticate,
  authorize(["admin"]),
  getAllDepartments
);

router.post(
  "/addDepartment",
  authenticate,
  authorize(["admin"]),
  addDepartment
)

router.delete(
  "/deleteDepartment/:deptId",
  authenticate,
  authorize(["admin"]),
  deleteDepartment
)

router.get(
  "/getAllPositions",
  authenticate,
  authorize(["admin"]),
  getAllPositions
)

router.post(
  "/addPosition",
  authenticate,
  authorize(["admin"]),
  addPosition
)

router.delete(
  "/deletePosition/:posId",
  authenticate,
  authorize(["admin"]),
  deletePosition
)



router.get(
  "/getAllMeetingTypes",
  authenticate,
  authorize(["admin"]),
  getAllMeetingTypes
)

router.post(
  "/addMeetingType",
  authenticate,
  authorize(["admin"]),
  addMeetingType,
)

router.delete(
  "/deleteMeetingType/:typeId",
  authenticate,
  authorize(["admin"]),
  deleteMeetingType
)

//emp settings
router.get(
  "/getEmpIdConfig",
  authenticate,
  authorize(["admin"]),
  getEmpIdConfig
)

router.post(
  "/setEmpIdConfig",
  authenticate,
  authorize(["admin"]),
  setEmpIdConfig
)

router.get(
  "/getStandardWorkingHour",
  authenticate,
  authorize(["admin"]),
  getStandardWorkingHour
)

router.post(
  "/setStandardWorkingHour",
  authenticate,
  authorize(["admin"]),
  setStandardWorkingHour
)

//perf settings
router.get(
  "/getReviewCycleConfig",
  authenticate,
  authorize(["admin"]),
  getReviewCycleConfig
)

router.post(
  "/setReviewCycleConfig",
  authenticate,
  authorize(["admin"]),
  setReviewCycleConfig
)

router.get(
  "/getTaskScoreConfig",
  authenticate,
  authorize(["admin"]),
  getTaskScoreConfig
)

router.post(
  "/setTaskScoreConfig",
  authenticate,
  authorize(["admin"]),
  setTaskScoreConfig
)

router.get(
  "/getPerfMetricsConfig",
  authenticate,
  authorize(["admin"]),
  getPerfMetricsConfig
)

router.post(
  "/setPerfMetricsConfig",
  authenticate,
  authorize(["admin"]),
  setPerfMetricsConfig
)

router.post(
  "/reviewPerformance/:empId",
  authenticate,
  authorize(['admin']),
  reviewPerformance
)

router.get(
  "/getEmployeePerformance/:empId",
  authenticate,
  authorize(["admin"]),
  getEmployeePerformance
)




router.get("/getSettings", authenticate, authorize(["hr"]), getSettings)

router.patch('/save', authenticate, authorize(["hr"]), saveGeneralSettings);

router.patch('/attendance-settings', authenticate, authorize(["hr"]), updateSettings);


router.patch("/settings/payroll", authenticate, authorize(["hr"]), updatePayrollSettings);

router.get("/logout", authenticate, authorize(["hr"]), logoutAdmin);











export default router;




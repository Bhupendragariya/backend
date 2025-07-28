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
  refreshAccessToken,
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

router.get(
  "/leave-detailed",
  authenticate,
  authorize(["Admin"]),
  getLeavesWithEmployeeName
);

router.put(
  "/leave-approveLeave/:leaveId",
  authenticate,
  authorize(["Admin"]),
  reviewLeave
);

router.put(
  "/documentUpdateRequest/:docId",
  authenticate,
  authorize(["admin"]),
  approveOrRejectUpdateRequest
  authorize(["Admin"]),
  approveUpdateRequest
);

router.delete(
  "/documentDeleteRequest/:docId",
  authenticate,
  authorize(["admin"]),
  approveOrRejectDeleteRequest
  authorize(["Admin"]),
  approveDeleteRequest
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

router.get("/allMeetings", authenticate, authorize(["Admin"]), getUserMeetings);

router.post(
  "/createLeave",
  authenticate,
  authorize(["Admin"]),
  createLeaveByAdmin
);

router.get(
  "/getEmployeePerformance",
  authenticate,
  authorize(["Admin"]),
  getAllEmployeePerformance);


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

router.delete(
  "/deleteDepartment/:deptId",
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

router.post(
  "/reviewPerformance/:empId",
  authenticate,
  authorize(['Admin']),
  reviewPerformance
)

router.get(
  "/getEmployeePerformance/:empId",
  authenticate,
  authorize(["Admin"]),
  getEmployeePerformance
)

router.get(
  "/getAllEmployeePerformance",
  authenticate,
  authorize(["admin"]),
  getAllEmployeePerformance
)



router.get("/getSettings", authenticate, authorize(["Admin"]), getSettings)

router.patch('/save', authenticate, authorize(["Admin"]), saveGeneralSettings);

router.patch('/attendance-settings', authenticate, authorize(["Admin"]), updateSettings);


router.patch("/settings/payroll", authenticate, authorize(["Admin"]), updatePayrollSettings);

router.get("/refresh",  refreshAccessToken);



router.get("/logout", authenticate, authorize(["Admin"]), logoutAdmin);











export default router;




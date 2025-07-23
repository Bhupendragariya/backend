import { Router } from "express";
import {
  addEmployee,
  approveDeleteRequest,
  approveUpdateRequest,
  getAllEmployeeCards,
  getAttendanceRules,
  getAttendanceSettings,
  getGeneralSettings,
  getInboxMessages,
  getLeavesWithEmployeeName,
  getLocationSettings,
  getPreferences,
  getSinglePayslip,
  getWeekendDays,
  loginUser,
  reviewLeave,
  saveGeneralSettings,
  updateAttendanceRules,
  updateAttendanceSettings,
  updateLocationSettings,
  updatePreferences,
  updateSystemDefaults,
  updateWeekendDays,
} from "../controllers/hr.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  createLeaveByAdmin,
  createMeeting,
  getAllEmployeePerformance,
  getAllFeedbackMessages,
  getUnreadFeedbackCount,
  getUserMeetings,
  markFeedbackAsRead,
  saveEvaluation,
} from "../controllers/admin.controller.js";

const router = Router();

router.post("/loginUser", loginUser);

router.post("/addEmployee", authenticate, authorize(["hr"]), addEmployee);

router.get(
  "/leave-detailed",
  authenticate,
  authorize(["hr"]),
  getLeavesWithEmployeeName
);

router.put(
  "/leave-approveLeave/:leaveId",
  authenticate,
  authorize(["hr"]),
  reviewLeave
);

router.put(
  "/approveUpdateDocument/:docId",
  authenticate,
  authorize(["hr"]),
  approveUpdateRequest
);

router.delete(
  "/approveDeleteDocument/:docId",
  authenticate,
  authorize(["hr"]),
  approveDeleteRequest
);

router.get(
  "/messages/inbox",
  authenticate,
  authorize(["hr"]),
  getInboxMessages
);

router.get(
  "/feedbackRead",
  authenticate,
  authorize(["hr"]),
  markFeedbackAsRead
);

router.get(
  "/UnreadFeedbackCount",
  authenticate,
  authorize(["hr"]),
  getUnreadFeedbackCount
);

router.get(
  "/AllFeedbackMessages",
  authenticate,
  authorize(["hr"]),
  getAllFeedbackMessages
);

router.post("/addMeeting", authenticate, authorize(["hr"]), createMeeting);

router.get("/allMeetings", authenticate, authorize(["hr"]), getUserMeetings);

router.post(
  "/admin-create",
  authenticate,
  authorize(["hr"]),
  createLeaveByAdmin
);

router.get(
  "/getEmployeePerformance",
  authenticate,
  authorize(["hr"]),
  getAllEmployeePerformance
);


router.get(
  "/getSinglePayslip",
  authenticate,
  authorize(["hr"]),
  getSinglePayslip
);

router.get(
  "/getAllEmployee",
  authenticate,
  authorize(["hr"]),
  getAllEmployeeCards
);


router.post("/Evaluation", authenticate, authorize(["hr"]), saveEvaluation);


router.get("/getGeneralSettings", authenticate, authorize(["hr"]), getGeneralSettings)

router.post('/save', authenticate, authorize(["hr"]), saveGeneralSettings);



router.put('/system-defaults', authenticate, authorize(["hr"]), updateSystemDefaults);


router.get('/preferences', authenticate, authorize(["hr"]), getPreferences);
router.put('/preferences', authenticate, authorize(["hr"]), updatePreferences);


router.get('/attendance-settings', authenticate, authorize(["hr"]), getAttendanceSettings);
router.put('/attendance-settings', authenticate, authorize(["hr"]), updateAttendanceSettings);


router.get('/weekend-days', authenticate, authorize(["hr"]), getWeekendDays);
router.put('/weekend-days', authenticate, authorize(["hr"]), updateWeekendDays);


router.get('/location-settings', authenticate, authorize(["hr"]), getLocationSettings);
router.put('/location-settings',authenticate, authorize(["hr"]), updateLocationSettings);


router.get('/attendance-rules',authenticate, authorize(["hr"]), getAttendanceRules);
router.put('/attendance-rules',authenticate, authorize(["hr"]), updateAttendanceRules);


export default router;


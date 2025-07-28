import { Router } from "express";
import {
  addEmployee,
  approveDeleteRequest,
  approveUpdateRequest,
  getAllEmployeeCards,

  
  getInboxMessages,
  getLeavesWithEmployeeName,

  getSettings,
  getSinglePayslip,

  loginUser,
  logoutHr,
  refreshAccessToken,
  reviewLeave,
  saveEvaluation,
  saveGeneralSettings,
  updatePayrollSettings,
  updateSettings,
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
} from "../controllers/admin.controller.js";

const router = Router();

router.post("/loginUser", loginUser);

router.post("/addEmployee", authenticate, authorize(["HR"]), addEmployee);

router.get(
  "/leave-detailed",
  authenticate,
  authorize(["HR"]),
  getLeavesWithEmployeeName
);

router.put(
  "/leave-approveLeave/:leaveId",
  authenticate,
  authorize(["HR"]),
  reviewLeave
);

router.put(
  "/approveUpdateDocument/:docId",
  authenticate,
  authorize(["HR"]),
  approveUpdateRequest
);

router.delete(
  "/approveDeleteDocument/:docId",
  authenticate,
  authorize(["HR"]),
  approveDeleteRequest
);

router.get(
  "/messages/inbox",
  authenticate,
  authorize(["HR"]),
  getInboxMessages
);

router.get(
  "/feedbackRead",
  authenticate,
  authorize(["HR"]),
  markFeedbackAsRead
);

router.get(
  "/UnreadFeedbackCount",
  authenticate,
  authorize(["HR"]),
  getUnreadFeedbackCount
);

router.get(
  "/AllFeedbackMessages",
  authenticate,
  authorize(["HR"]),
  getAllFeedbackMessages
);

router.post("/addMeeting", authenticate, authorize(["HR"]), createMeeting);

router.get("/allMeetings", authenticate, authorize(["HR"]), getUserMeetings);

router.post(
  "/createLeave",
  authenticate,
  authorize(["HR"]),
  createLeaveByAdmin
);

router.get(
  "/getEmployeePerformance",
  authenticate,
  authorize(["HR"]),
  getAllEmployeePerformance
);


router.get(
  "/getSinglePayslip",
  authenticate,
  authorize(["HR"]),
  getSinglePayslip
);

router.get(
  "/getAllEmployee",
  authenticate,
  authorize(["HR"]),
  getAllEmployeeCards
);


router.post("/Evaluation", authenticate, authorize(["HR"]), saveEvaluation);


router.get("/getSettings", authenticate, authorize(["HR"]), getSettings)

router.patch('/save', authenticate, authorize(["HR"]), saveGeneralSettings);

router.patch('/attendance-settings', authenticate, authorize(["HR"]), updateSettings);


router.patch("/settings/payroll", authenticate, authorize(["HR"]), updatePayrollSettings);

router.get("/logout", authenticate, authorize(["HR"]), logoutHr);

router.patch("/refresh", authenticate, authorize(["HR"]), refreshAccessToken);




export default router;


import { Router } from "express";
import {
  addEmployee,
  approveDeleteRequest,
  approveUpdateRequest,
  getInboxMessages,
  getLeavesWithEmployeeName,
  loginUser,
  registerUser,
  reviewLeave,
} from "../controllers/admin.controller.js";
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
} from "../controllers/hr.controller.js";

const router = Router();

router.post("/registerUser", registerUser);

router.post("/loginUser", loginUser);

router.post("/addEmployee", authenticate, authorize(["admin"]), addEmployee);

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
  "/messages/inbox",
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

router.get("/allMeetings", authenticate, authorize(["admin"]), getUserMeetings);

router.get(
  "/getEmployeePerformance",
  authenticate,
  authorize(["admin"]),
  getAllEmployeePerformance
);

router.post("/Meeting", authenticate, authorize(["admin"]), createMeeting);

router.post(
  "/admin-create",
  authenticate,
  authorize(["admin"]),
  createLeaveByAdmin
);

router.post("/Evaluation", authenticate, authorize(["admin"]), saveEvaluation);

export default router;

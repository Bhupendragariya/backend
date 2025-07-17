import { Router } from "express";
import {
  addEmployee,
  approveDeleteRequest,
  approveUpdateRequest,
  getInboxMessages,
  getLeavesWithEmployeeName,
  loginUser,
  reviewLeave,
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
  "/approveUpdatedocument/:docId",
  authenticate,
  authorize(["hr"]),
  approveUpdateRequest
);

router.delete(
  "/approveDeletedocument/:docId",
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

router.post("/Evaluation", authenticate, authorize(["hr"]), saveEvaluation);

export default router;

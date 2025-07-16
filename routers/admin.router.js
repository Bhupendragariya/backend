import { Router } from "express";
import {
  addDepartment,
  addEmployee,
  addPosition,
  approveDeleteRequest,
  approveUpdateRequest,
  createLeaveByAdmin,
  createMeeting,
  deleteDepartment,
  deletePosition,
  getAllEmployeePerformance,
  getAllFeedbackMessages,
  getInboxMessages,
  getLeavesWithEmployeeName,
  getUnreadFeedbackCount,
  getUserMeetings,
  loginUser,
  markFeedbackAsRead,
  registerUser,
  reviewLeave,
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
  getAllEmployeePerformance
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


export default router;

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
  getInboxMessages,
  getLeavesWithEmployeeName,
  getUserMeetings,
  getSinglePayslip,
  getUnreadFeedbackCount,
  loginUser,
  markFeedbackAsRead,
  registerUser,
  reviewLeave,
  setEmpIdConfig,
  updateEmpIdConfig,
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

//settings
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

router.put(
  "/updateEmpIdConfig",
  authenticate,
  authorize(["admin"]),
  updateEmpIdConfig
)


export default router;

import { Router } from "express";
import {
  addDepartment,
  addEmployee,
  addMeetingType,
  addMetric,
  addPosition,
  approveOrRejectDeleteRequest,
  approveOrRejectUpdateRequest,
  createMeeting,
  createLeaveByAdmin,

  deleteDepartment,
  deleteMeetingType,
  deleteMetric,
  deletePosition,
  editAttendence,
  getAllDepartments,
  getAllMeetingTypes,
  getAllMetrics,
  getAllPositions,
  getEmployeeConfig,
  getEmployeePerformance,
  getInboxMessages,
  getLeavesWithEmployeeName,
  getMetricById,
  getPerformanceConfig,
  // getUserMeetings,
  loginUser,
  markFeedbackAsRead,
  registerUser,
  reviewLeave,
  reviewPerformance,
  setEmployeeConfig,
  setPerformanceConfig,
  updateMetric,
  getLeaveTypeNamesEnum,
  getEmployees,
  getDepartments,
  createLeaveType,
  updateLeaveType,
  updateCarryForwardRules,
  updateLeaveRules,
  getAllEmployeePerformance,
} from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import validate from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "../validations/userValidation.js";
import { addMeetingSchema, addMeetingTypeSchema } from "../validations/meetingValidation.js";
import { addEmployeeSchema } from "../validations/employeeValidation.js";
import { editAttendanceSchema } from "../validations/attendanceValidation.js";

const router = Router();

router.post(
  "/registerUser",
  validate(registerSchema),
  registerUser
);

router.post(
  "/login",
  validate(loginSchema),
  loginUser
);

router.post("/addEmployee",
  authenticate,
  authorize(["Admin"]),
  upload.fields([
    { name: 'empPhoto' },
    { name: 'empIdProof' },
    { name: 'emp10PassCert' },
    { name: 'emp12PassCert' },
    { name: 'empGradCert' },
    { name: 'empExpCert' }
  ]),
  validate(addEmployeeSchema),
  addEmployee
);

//----------leave,attendance--------------
router.put(
  "/editAttendence/:attId",
  authenticate,
  authorize(["admin"]),
  validate(editAttendanceSchema),
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


//----------doc--------------
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

//----------depatment,position--------------

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

//----------meeting--------------
router.post(
  "/addMeeting",
  authenticate,
  authorize(["admin"]),
  // validate(addMeetingSchema),
  createMeeting
);

// router.get(
//   "/allMeetings",
//   authenticate,
//   authorize(["admin"]),
//   validate(addMeetingTypeSchema),
//   getUserMeetings

// );

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



router.post(
  "/createLeaveType",
  authenticate,
  authorize(["Admin"]),
  createLeaveType
)



router.put(
  "/updateLeaveType/:id",
  authenticate,
  authorize(["Admin"]),
  updateLeaveType
)

router.put(
  "/leave-types/:leaveTypeId/carry-forward",
  authenticate,
  authorize(["Admin"]),
  updateCarryForwardRules
)

router.put(
  "/:leaveTypeId/updateLeaveRules",
  authenticate,
  authorize(["Admin"]),
  updateLeaveRules
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

router.get(
  "/getAllEmployeePerformance",
  authenticate,
  authorize(["admin"]),
  getAllEmployeePerformance
)

//----------message--------------
router.get(
  '/messages/inbox',
  authenticate,
  authorize(["admin"]),
  getInboxMessages
);

//----------emp settings--------------
// router.get(
//   "/getEmpIdConfig",
//   authenticate,
//   authorize(["admin"]),
//   getEmpIdConfig
// )

// router.post(
//   "/setEmpIdConfig",
//   authenticate,
//   authorize(["admin"]),
//   setEmpIdConfig
// )

// router.get(
//   "/getStandardWorkingHour",
//   authenticate,
//   authorize(["admin"]),
//   getStandardWorkingHour
// )

// router.post(
//   "/setStandardWorkingHour",
//   authenticate,
//   authorize(["admin"]),
//   setStandardWorkingHour
// )

router.get(
  "/getEmployeeConfig",
  authenticate,
  authorize(["admin"]),
  getEmployeeConfig
)

router.post(
  "/setEmployeeConfig",
  authenticate,
  authorize(["admin"]),
  setEmployeeConfig
)

//----------performance settings--------------
// router.get(
//   "/getReviewCycleConfig",
//   authenticate,
//   authorize(["admin"]),
//   getReviewCycleConfig
// )

// router.post(
//   "/setReviewCycleConfig",
//   authenticate,
//   authorize(["admin"]),
//   setReviewCycleConfig
// )

// router.get(
//   "/getTaskScoreConfig",
//   authenticate,
//   authorize(["admin"]),
//   getTaskScoreConfig
// )

// router.post(
//   "/setTaskScoreConfig",
//   authenticate,
//   authorize(["admin"]),
//   setTaskScoreConfig
// )

// router.get(
//   "/getPerfMetricsConfig",
//   authenticate,
//   authorize(["admin"]),
//   getPerfMetricsConfig
// )

// router.post(
//   "/setPerfMetricsConfig",
//   authenticate,
//   authorize(["admin"]),
//   setPerfMetricsConfig
// )

router.get(
  "/getPerformanceConfig",
  authenticate,
  authorize(["admin"]),
  getPerformanceConfig
)

router.post(
  "/setPerformanceConfig",
  authenticate,
  authorize(["admin"]),
  setPerformanceConfig
)

router.get(
  "/getAllMetrics",
  authenticate,
  authorize(["admin"]),
  getAllMetrics
)

router.get(
  "/getMetric/:metricId",
  authenticate,
  authorize(["admin"]),
  getMetricById,
)

router.post(
  "/addMetric",
  authenticate,
  authorize(["admin"]),
  addMetric
)

router.put(
  "/updateMetric/:metricId",
  authenticate,
  authorize(["admin"]),
  updateMetric
)

router.delete(
  "/deleteMetric/:metricId",
  authenticate,
  authorize(["admin"]),
  deleteMetric
)



export default router;




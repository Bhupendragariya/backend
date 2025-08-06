import { Router } from "express";
import { addDocument, addOrUpdateBankAccount, applyLeave, changePassword, deleteDocument, updateDocument, employeeLogin, getEmployeeDashboard, getNotifications, getUnreadNotifications, markNotificationAsRead, submitResignation, sendMessageToUser, markMessageAsRead, updateProfileAndAddressInfo, getEmployeeDetails } from "../controllers/employee.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import validate from "../middlewares/validate.js";
import { updateProfileAndAddressSchema } from "../validations/employeeValidation.js";



const router = Router();



router.post(
  "/employeeLogin",
  employeeLogin
);

router.put(
  "/changePassword",
  authenticate,
  authorize(["employee"]),
  changePassword
);

router.get(
  "/getdashbord",
  authenticate,
  authorize(["employee"]),
  getEmployeeDashboard
);

router.put(
  "/updateProfileAndAddressInfo/:empId",
  authenticate,
  authorize(["employee"]),
  upload.single('empPhoto'),
  validate(updateProfileAndAddressSchema),
  updateProfileAndAddressInfo
)

router.get('/getEmployeeDetails/:empId',
  authenticate,
  authorize(["employee"]),
  getEmployeeDetails
)

router.put(
  "/updateBankAccount",
  authenticate,
  authorize(["employee"]),
  addOrUpdateBankAccount
);

router.post(
  "/submitResignation",
  authenticate,
  authorize(["employee"]),
  submitResignation
);

//----------leave--------------
router.post(
  "/createLeave",
  authenticate,
  authorize(["employee"]),
  applyLeave
);

//----------message,notification--------------
router.post('/messages/send',
  upload.single('file'),
  sendMessageToUser
);

router.put(
  "/messages/:id/read",
  authenticate,
  authorize(["employee"]),
  markMessageAsRead
);

router.get(
  "/notifications",
  authenticate,
  authorize(["employee"]),
  getNotifications
);

router.put(
  "/notifications/:id/read",
  authenticate,
  authorize(["employee"]),
  markNotificationAsRead
);

router.get(
  "/notifications/unread",
  authenticate,
  authorize(["employee"]),
  getUnreadNotifications
);


//----------doc--------------
router.post(
  "/addDocument/:userId",
  authenticate,
  authorize(["employee"]),
  upload.single('empDocument'),
  addDocument
);

router.put(
  "/:userId/updateDocument/:docId",
  authenticate,
  authorize(["employee"]),
  upload.single('empDocument'),
  updateDocument
);

router.delete(
  "/:userId/deleteDocument/:docId",
  authenticate,
  authorize(["employee"]),
  deleteDocument
)







export default router
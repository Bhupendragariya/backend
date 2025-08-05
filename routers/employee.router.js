import { Router } from "express";
import { addDocument, addOrUpdateBankAccount, applyLeave, changePassword, deleteDocument, updateDocument, employeeLogin, getEmployeeDashboard, getNotifications, getUnreadNotifications, markNotificationAsRead, submitResignation, sendMessageToUser, markMessageAsRead, updateProfileAndAddressInfo, getEmployeeDetails, getMyAttendance, getUserMeetings, generatePayslip, markAttendance, logoutUser, refreshAccessToken } from "../controllers/employee.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";



const router = Router();



router.post("/login", employeeLogin);

router.put("/changePassword", authenticate, authorize(["Employee"]), changePassword);

router.get("/getdashbord", authenticate, authorize(["Employee"]), getEmployeeDashboard);

router.post("/createLeave", authenticate, authorize(["Employee"]), applyLeave);

router.get("/notifications", authenticate, authorize(["Employee"]), getNotifications);

router.get("/MyAttendance", authenticate, authorize(["Employee"]), getMyAttendance);

router.put("/notifications/:id/read", authenticate, authorize(["Employee"]), markNotificationAsRead);

router.get("/notifications/unread", authenticate, authorize(["Employee"]), getUnreadNotifications);

router.get("/Meeting", authenticate, authorize(["Employee"]), getUserMeetings);

router.put("/updateBankAccount", authenticate, authorize(["employee"]), addOrUpdateBankAccount);

router.post("submitResignation", authenticate, authorize(["employee"]), submitResignation);

router.post("/addDocument/:userId", authenticate, authorize(["employee"]), upload.single('empDocument'), addDocument);

router.put("/:userId/updateDocument/:docId", authenticate, authorize(["employee"]), upload.single('empDocument'), updateDocument);

router.delete("/deleteDocument/:userId/:docId", authenticate, authorize(["Employee"]), deleteDocument);
router.delete("/:userId/deleteDocument/:docId", authenticate, authorize(["employee"]), deleteDocument)

router.post('/messages/send',  authenticate, authorize(["Employee"]),  upload.single('file'), sendMessageToUser);

router.put("/messages/:id/read", authenticate, authorize(["Employee"]), markMessageAsRead);

router.get("/Payslip", authenticate, authorize(["Employee"]), generatePayslip);

router.post("/attendance",  authenticate, authorize(["Employee"]),  markAttendance);



router.get("/logout", authenticate, authorize(["Employee"]), logoutUser);


router.get("/refresh", authenticate, authorize(["Employee"]), refreshAccessToken);

router.put("/messages/:id/read", authenticate, authorize(["employee"]), markMessageAsRead);

router.put("/updateProfileAndAddressInfo/:empId", authenticate, authorize(["employee"]), upload.single('empPhoto'), updateProfileAndAddressInfo)

router.get('/getEmployeeDetails/:empId', authenticate, authorize(["employee"]), getEmployeeDetails)




export default router
import { Router } from "express";
import { addDocument, addOrUpdateBankAccount, applyLeave, changePassword, deleteDocument, updateDocument, employeeLogin, getEmployeeDashboard, getNotifications, getUnreadNotifications, markNotificationAsRead, submitResignation, sendMessageToUser, markMessageAsRead, getMyAttendance, getUserMeetings, generatePayslip } from "../controllers/employee.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";



const router = Router();



router.post("/employeeLogin", employeeLogin);

router.put("/changePassword", authenticate, authorize(["employee"]), changePassword);

router.get("/getdashbord", authenticate, authorize(["employee"]), getEmployeeDashboard);

router.post("/createLeave", authenticate, authorize(["employee"]), applyLeave);

router.get("/notifications", authenticate, authorize(["employee"]), getNotifications);

router.get("/MyAttendance", authenticate, authorize(["employee"]), getMyAttendance);

router.put("/notifications/:id/read", authenticate, authorize(["employee"]), markNotificationAsRead);

router.get("/notifications/unread", authenticate, authorize(["employee"]), getUnreadNotifications);

router.get("/Meetings", authenticate, authorize(["employee"]), getUserMeetings);

router.put("/update-bankAccount", authenticate, authorize(["employee"]), addOrUpdateBankAccount);

router.post("Submit-Resignation", authenticate, authorize(["employee"]), submitResignation);

router.post("/addDocument/:userId", authenticate, authorize(["employee"]), upload.single('empDocument'), addDocument);

router.put("/updateDocument/:userId/:docId", authenticate, authorize(["employee"]), upload.single('empDocument'), updateDocument);

router.delete("/deleteDocument/:userId/:docId", authenticate, authorize(["employee"]), deleteDocument);

router.post('/messages/send',  authenticate, authorize(["employee"]),  upload.single('file'), sendMessageToUser);

router.put("/messages/:id/read", authenticate, authorize(["employee"]), markMessageAsRead);

router.get("/Payslip", authenticate, authorize(["employee"]), generatePayslip);



export default router
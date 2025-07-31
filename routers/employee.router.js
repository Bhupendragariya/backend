import { Router } from "express";
import { addDocument, addOrUpdateBankAccount, applyLeave, changePassword, deleteDocument, updateDocument, employeeLogin, getEmployeeDashboard, getNotifications, getUnreadNotifications, markNotificationAsRead, submitResignation, sendMessageToUser, markMessageAsRead, updateProfileAndAddressInfo, getEmployeeDetails } from "../controllers/employee.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";



const router = Router();



router.post("/employeeLogin", employeeLogin);

router.put("/changePassword", authenticate, authorize(["employee"]), changePassword);

router.get("/getdashbord", authenticate, authorize(["employee"]), getEmployeeDashboard);

router.post("/createLeave", authenticate, authorize(["employee"]), applyLeave);

router.get("/notifications", authenticate, authorize(["employee"]), getNotifications);

router.put("/notifications/:id/read", authenticate, authorize(["employee"]), markNotificationAsRead);

router.get("/notifications/unread", authenticate, authorize(["employee"]), getUnreadNotifications);

router.put("/updateBankAccount", authenticate, authorize(["employee"]), addOrUpdateBankAccount);

router.post("submitResignation", authenticate, authorize(["employee"]), submitResignation);

router.post("/addDocument/:userId", authenticate, authorize(["employee"]), upload.single('empDocument'), addDocument);

router.put("/:userId/updateDocument/:docId", authenticate, authorize(["employee"]), upload.single('empDocument'), updateDocument);

router.delete("/:userId/deleteDocument/:docId", authenticate, authorize(["employee"]), deleteDocument)

router.post('/messages/send', upload.single('file'), sendMessageToUser);

router.put("/messages/:id/read", authenticate, authorize(["employee"]), markMessageAsRead);

router.put("/updateProfileAndAddressInfo/:empId", authenticate, authorize(["employee"]), upload.single('empPhoto'), updateProfileAndAddressInfo)

router.get('/getEmployeeDetails/:empId', authenticate, authorize(["employee"]), getEmployeeDetails)




export default router
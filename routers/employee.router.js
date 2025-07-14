import { Router } from "express";
import { addDocument, addOrUpdateBankAccount, applyLeave, changePassword,  deleteDocument, updateDocument,  employeeLogin, getEmployeeDashboard, getNotifications, getUnreadNotifications, markNotificationAsRead, submitResignation,  sendMessageToUser, markMessageAsRead} from "../controllers/employee.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";



const router = Router();



router.post("/employeeLogin",    employeeLogin);

router.put("/changePassword", authenticate, authorize(["employee"]), changePassword);

router.get("/getdashbord", authenticate, authorize(["employee"]),  getEmployeeDashboard);

router.post("/createLeave", authenticate, authorize(["employee"]),  applyLeave);

router.get("/notifications", authenticate, authorize(["employee"]), getNotifications);

router.put("/notifications/:id/read", authenticate, authorize(["employee"]), markNotificationAsRead);

router.get("/notifications/unread", authenticate, authorize(["employee"]), getUnreadNotifications);

router.put("/update-bankAccount", authenticate, authorize(["employee"]), addOrUpdateBankAccount);

router.post("Submit-Resignation", authenticate, authorize(["employee"]), submitResignation);

router.post("/addDocument/:empId", authenticate, authorize(["employee"]), upload.single('empDocument'), addDocument);

router.post('/messages/send', upload.single('file'), sendMessageToUser);

router.put("/updateDocument/:empId/:docId", authenticate, authorize(["employee"]), upload.single('empDocument'), updateDocument);

router.delete("/deleteDocument/:empId/:docId", authenticate, authorize(["employee"]), deleteDocument);

router.put("/messages/:id/read", authenticate, authorize(["employee"]), markMessageAsRead);




export default router
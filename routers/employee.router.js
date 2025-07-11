import { Router } from "express";
import { addOrUpdateBankAccount, applyLeave, changePassword, createEditRequest, editDocument, employeeLogin, getEmployeeDashboard, getNotifications, getUnreadNotifications, markNotificationAsRead, submitResignation } from "../controllers/employee.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";



const router = Router();


router.post("/employeeLogin",    employeeLogin);

router.put("/changePassword", authenticate, authorize(["employee"]), changePassword);

router.get("/getdashbord", authenticate, authorize(["employee"]),  getEmployeeDashboard);

router.post("/createLeave", authenticate, authorize(["employee"]),  applyLeave);

router.post("/EditRequest", authenticate, authorize(["employee"]), createEditRequest);

router.put("/document/:documentId",   authenticate, authorize(["employee"]),   editDocument);

router.get("/notifications", authenticate, authorize(["employee"]), getNotifications);

router.put("/notifications/:id/read", authenticate, authorize(["employee"]), markNotificationAsRead);

router.get("/notifications/unread", authenticate, authorize(["employee"]), getUnreadNotifications);

router.put("/update-bankAccount", authenticate, authorize(["employee"]), addOrUpdateBankAccount);

router.post("Submit-Resignation", authenticate, authorize(["employee"]), submitResignation);







export default router
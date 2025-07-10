import { Router } from "express";
import { applyLeave, createEditRequest, editDocument, employeeLogin, getEmployeeDashboard, getNotifications, markNotificationAsRead } from "../controllers/employee.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";



const router = Router();


router.post("/employeeLogin",    employeeLogin);

router.get("/getdashbord", authenticate, authorize(["employee"]),  getEmployeeDashboard);

router.post("/createLeave", authenticate, authorize(["employee"]),  applyLeave);

router.post("/EditRequest", authenticate, authorize(["employee"]), createEditRequest);

router.put("/document/:documentId",   authenticate, authorize(["employee"]),   editDocument);

router.get("/notifications", authenticate, authorize(["employee"]), getNotifications);

router.put("notifications/:id/read", authenticate, authorize(["employee"]), markNotificationAsRead);









export default router
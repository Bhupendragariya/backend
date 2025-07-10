import { Router } from "express";
import { applyLeave, employeeLogin, getEmployeeDashboard } from "../controllers/employee.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";



const router = Router();


router.post("/employeeLogin",    employeeLogin);

router.get("/getdashbord", authenticate, authorize(["employee"]),  getEmployeeDashboard);

router.post("/createLeave", authenticate, authorize(["employee"]),  applyLeave);






export default router
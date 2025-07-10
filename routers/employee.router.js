import { Router } from "express";
import { applyLeave, getEmployeeDashboard } from "../controllers/employee.controller.js";



const router = Router();

router.get("/getdashbord",   getEmployeeDashboard);

router.post("/createLeave",   applyLeave);





export default router
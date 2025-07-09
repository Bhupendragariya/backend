import { Router } from "express";
import { applyLeave, getEmployeeDashboard } from "../controllers/employee.controller";



const router = Router();

router.get("/getdashbord",   getEmployeeDashboard);

router.get("/createLeave",   applyLeave);





export default router
import { Router } from "express";
import { addEmployee,  getLeavesWithEmployeeName, loginUser, registerUser, reviewEditRequest, reviewLeave } from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";





const router = Router();

router.post("/registerUser",   registerUser);


router.post("/loginUser",   loginUser);

router.post("/addEmployee", authenticate, authorize(["admin"]),   addEmployee);

router.get("/leave-detailed", authenticate, authorize(["admin"]),   getLeavesWithEmployeeName);


router.put("/leave-approveLeave/:leaveId", authenticate, authorize(["admin"]),   reviewLeave);

router.put("/editRequest/:requestId", authenticate, authorize(["admin"]),   reviewEditRequest);








export default router
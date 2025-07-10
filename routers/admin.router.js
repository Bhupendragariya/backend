import { Router } from "express";
import { addEmployee, loginUser, registerUser } from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";





const router = Router();

router.post("/registerUser",   registerUser);

router.post("/loginUser",   loginUser);

router.post("/addEmployee", authenticate, authorize(["admin"]),   addEmployee);





export default router
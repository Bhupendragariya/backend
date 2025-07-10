import { Router } from "express";
import { addEmployee } from "../controllers/hr.controller.js";


const router = Router();

router.post("/add-Employee",     addEmployee);





export default router
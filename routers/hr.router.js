import { Router } from "express";
import { addEmployee } from "../controllers/hr.controller";


const router = Router();

router.post("/add-Employee",   addEmployee);








export default router
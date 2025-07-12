import { Router } from "express";
import {
  addEmployee,
  approveDeleteRequest,
  approveUpdateRequest,
  getLeavesWithEmployeeName,
  loginUser,
  registerUser,
  reviewLeave,
} from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

router.post("/registerUser", registerUser);

router.post("/loginUser", loginUser);

router.post("/addEmployee", authenticate, authorize(["admin"]), addEmployee);

router.get(
  "/leave-detailed",
  authenticate,
  authorize(["admin"]),
  getLeavesWithEmployeeName
);

router.put(
  "/leave-approveLeave/:leaveId",
  authenticate,
  authorize(["admin"]),
  reviewLeave
);

router.put(
  "/approveUpdateDocument/:docId",
  authenticate,
  authorize(["admin"]),
  approveUpdateRequest
);

router.delete(
  "/approveDeleteDocument/:docId",
  authenticate,
  authorize(["hr", "admin"]),
  approveDeleteRequest
);

export default router;

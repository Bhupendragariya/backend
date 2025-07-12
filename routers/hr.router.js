import { Router } from "express";
import {
  addEmployee,
  approveDeleteRequest,
  approveUpdateRequest,
  getLeavesWithEmployeeName,
  loginUser,
  reviewEditRequest,
  reviewLeave,
} from "../controllers/hr.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

router.post("/loginUser", loginUser);

router.post("/addEmployee", authenticate, authorize(["hr"]), addEmployee);

router.get(
  "/leave-detailed",
  authenticate,
  authorize(["hr"]),
  getLeavesWithEmployeeName
);

router.put(
  "/leave-approveLeave/:leaveId",
  authenticate,
  authorize(["hr"]),
  reviewLeave
);

router.put(
  "/editRequest/:requestId",
  authenticate,
  authorize(["hr"]),
  reviewEditRequest
);

router.put(
  "/approveUpdate/:docId",
  authenticate,
  authorize(["hr"]),
  approveUpdateRequest
);

router.delete(
  "/approveDelete/:docId",
  authenticate,
  authorize(["hr"]),
  approveDeleteRequest
);

export default router;

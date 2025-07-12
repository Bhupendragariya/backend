import { Router } from "express";
import {
  addEmployee,
  approveDeleteRequest,
  approveUpdateRequest,
  getLeavesWithEmployeeName,
  loginUser,
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
  "/approveUpdatedocument/:docId",
  authenticate,
  authorize(["hr"]),
  approveUpdateRequest
);

router.delete(
  "/approveDeletedocument/:docId",
  authenticate,
  authorize(["hr"]),
  approveDeleteRequest
);

export default router;

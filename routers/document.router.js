import { Router } from "express";

import { addDocument, approveDeleteRequest, approveUpdateRequest, deleteDocument, updateDocument } from "../controllers/document.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const router = Router();

router.post("/add/:empId", authenticate, authorize(["employee", "admin", "hr"]), upload.single('empDocument'), addDocument);

router.put("/update/:empId/:docId", authenticate, authorize(["employee", "admin", "hr"]), upload.single('empDocument'), updateDocument);

router.delete("/delete/:empId/:docId", authenticate, authorize(["employee", "admin", "hr"]), deleteDocument);

router.put("/approveUpdate/:docId", authenticate, authorize(["hr", "admin"]), approveUpdateRequest)

router.delete("/approveDelete/:docId", authenticate, authorize(["hr", "admin"]), approveDeleteRequest);


export default router;
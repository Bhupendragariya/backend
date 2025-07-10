import { Router } from "express";
import { addDocument, deleteDocument, updateDocument } from "../controllers/document.controller";

const router = Router();

router.post("/addDocument/:empId", upload.single('empDocument'), addDocument);

router.put("/updateDocument/:empId", upload.single('empDocument'), updateDocument);

router.delete("/deleteDocument/:empId/:docId", deleteDocument);

export default router;
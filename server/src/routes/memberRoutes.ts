import { Router } from "express";
import {
  createMember,
  deleteMember,
  listMembers,
  updateMember
} from "../controllers/memberController";
import { authMiddleware } from "../middlewares/authMiddleware";

export const memberRouter = Router();

memberRouter.use(authMiddleware);

memberRouter.get("/", listMembers);
memberRouter.post("/", createMember);
memberRouter.put("/:id", updateMember);
memberRouter.delete("/:id", deleteMember);


import express from "express";
import { getPublicStatus } from "../controller/statusController.js";
export const publicStatusRouter=express.Router()
publicStatusRouter.get("/:userId",getPublicStatus)
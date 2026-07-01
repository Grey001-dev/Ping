import express from 'express';
const myMonitorRouter=express.Router()
import {getMonitors,createMonitors,deleteMonitor,editMonitors } from "../controller/monitorController.js";
import {verifyToken} from '../middleware/auth.js';
import {togglePause} from '../controller/monitorController.js'

// all monitor routes are protected i.e the user must be logged in

myMonitorRouter.get('/',verifyToken,getMonitors);
myMonitorRouter.post("/",verifyToken, createMonitors);
myMonitorRouter.delete("/:id",verifyToken,deleteMonitor);
myMonitorRouter.patch("/:id/pause",verifyToken,togglePause)
myMonitorRouter.patch("/:id/update",verifyToken,editMonitors)
export default myMonitorRouter
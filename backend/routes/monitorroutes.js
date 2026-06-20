import express from 'express';
const myMonitorRouter=express.Router()
import {getMonitors,createMonitors,deleteMonitor} from "../controller/monitorController.js";
import {verifyToken} from '../middleware/auth.js';

// all monitor routes are protected i.e the user must be logged in

myMonitorRouter.get('/',verifyToken,getMonitors);
myMonitorRouter.post("/",verifyToken, createMonitors);
myMonitorRouter.delete("/:id",verifyToken,deleteMonitor);

export default myMonitorRouter
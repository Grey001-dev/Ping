import express from 'express'
import { getIncidents,getIncidentsyMonitor } from '../controller/getincidents.js'
import { verifyToken } from '../middleware/auth.js'


export const incidentRouter=express.Router();
incidentRouter.get("/",verifyToken,getIncidents);
incidentRouter.get("/:monitorId",verifyToken,getIncidentsyMonitor)


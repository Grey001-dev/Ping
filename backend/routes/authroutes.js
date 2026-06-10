import express from 'express'
const router=express.Router()
import { handleauth } from '../controller/handleauth.js';
//handles the routing for the auth
router.post("/",handleauth)
export default router
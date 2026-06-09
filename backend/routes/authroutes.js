import express from 'express'
const router=express.Router()
import { handleauth } from '../controller/handleauth.js';

router.post("/",handleauth)
export default router
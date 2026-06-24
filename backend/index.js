import dotenv from 'dotenv';
dotenv.config()
import express from 'express';
import cors from 'cors'
import authroutes from './routes/authroutes.js'
import db from './config/db.js';
import cookieParser from "cookie-parser";
import myMonitorRouter from './routes/monitorroutes.js';
import { startAllMonitors } from './workers/pingWorkers.js';

const app=express();
app.use(cookieParser())
app.use(cors({
    origin:'http://localhost:5173',
    methods:["GET","POST","DELETE"],
    allowedHeaders:["Content-Type","Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended:true }));

//Routes
app.use('/auth/users',authroutes)
app.use('/api/monitors',myMonitorRouter)
app.get("/",(req,res)=>{
    res.json({
        success:true,
        message:"Api is running"
    })
})
try{
    const result=await db.query('SELECT NOW()')
    console.log('Database Connected:',result.rows[0])
    // startAllMonitors
   
}catch(err){
    console.error('Database error:',err.message)
}


app.listen(process.env.PORT || 5000,()=>{
    console.log("Server running no fear")
})
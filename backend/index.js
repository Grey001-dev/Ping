import dotenv from 'dotenv';
dotenv.config()
import express from 'express';
import cors from 'cors'
import authroutes from './routes/authroutes.js'
import db from './config/db.js';
import cookieParser from "cookie-parser";
import myMonitorRouter from './routes/monitorroutes.js';
import { startAllMonitors } from './workers/pingWorkers.js';
import {createServer} from 'http';
import {Server} from 'socket.io';
import userRouter from './routes/userroutes.js';
import { incidentRouter } from './routes/incidentroutes.js';
import { publicStatusRouter } from './routes/publicstatusroutes.js';
const app=express();
const httpServer=createServer(app);
export const io=new Server(httpServer,{
    cors:{
        origin:process.env.NODE_ENV==='production'
        ? 'https://ping001.netlify.app'
        : 'http://localhost:5173'
        ,
        credentials:true,
        methods:["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
        allowedHeaders:['Content-Type','application/json']
    }
})

app.use(cookieParser())
app.use(cors({
    origin:process.env.NODE_ENV==='production'
    ? 'https://ping001.netlify.app'
    : 'http://localhost:5173'
    ,
    credentials:true,
    methods:["GET","POST","DELETE","PATCH","PUT","OPTIONS"],
    allowedHeaders:["Content-Type","Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended:true }));

//Routes
app.use('/auth/users',authroutes)
app.use('/api/monitors',myMonitorRouter)
app.use('/api/users',userRouter)
app.use('/api/incidents',incidentRouter)
app.use("/api/status",publicStatusRouter);


io.on('connection',(socket)=>{
    console.log(`Frontend client connected to socket:${socket.id}`)
})

try{
    const result=await db.query('SELECT NOW()')
    console.log('Database Connected:',result.rows[0])
   
}catch(err){
    console.error('Database error:',err.message)
}


httpServer.listen(process.env.PORT || 5000,()=>{
    console.log("Server running no fear")

    startAllMonitors();
})
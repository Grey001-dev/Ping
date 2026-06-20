import dotenv from 'dotenv';
dotenv.config()
import express from 'express';
import cors from 'cors'
import authroutes from './routes/authroutes.js'
import db from './config/db.js';
import myMonitorRouter from './routes/monitorroutes.js';

const app=express();

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended:true }))

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
}catch(err){
    console.error('Database error:',err.message)
}


app.listen(process.env.PORT || 5000,()=>{
    console.log("Server running no fear")
})
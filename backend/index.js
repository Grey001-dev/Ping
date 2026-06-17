import express from 'express';
import cors from 'cors'
import authroutes from './routes/authroutes.js'
import dotenv from 'dotenv'
import db from './config/db.js';
dotenv.config()
const app=express();

app.use(cors())
app.use(express.json())
//Routes
app.use('/auth/users',authroutes)

app.use(express.urlencoded({extended:true}))

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
import express from 'express';
import cors from 'cors'
import authroutes from './routes/authroutes.js'
import dotenv from 'dotenv'
const app=express();
dotenv.config()

app.use('api/users',authroutes)
app.use(cors());
app.use(express.urlencoded({extended:true}))

app.get("/",(req,res)=>{
    res.json({
        success:true,
        message:"Api is running"
    })
})


app.listen(process.env.PORT,()=>{
    console.log("Server running no fear")
})
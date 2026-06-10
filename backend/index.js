import express from 'express';
import cors from 'cors'
import authroutes from './routes/authroutes.js'
import dotenv from 'dotenv'
const app=express();
dotenv.config()

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


app.listen(process.env.PORT || 5000,()=>{
    console.log("Server running no fear")
})
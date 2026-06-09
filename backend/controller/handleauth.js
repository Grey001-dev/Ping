import { name } from "ejs";
import db from "../config/db.js";
import bcrypt from 'bcryptjs';

export const handleauth=async(req,res)=>{
    const {isSignup,username,email,password,}=req.body;
    try{
        if(isSignup){
            const userExist= await db.query('SELECT * FROM users WHERE email = $1,'[email])
            if(userExist.rows.length>0){
                return res.status(400).json({message :'Email is already registered'})
            }
            const salt=await bcrypt.genSalt(10)
            const hashedPassword=await bcrypt.hash(password,salt);

            const newUser=await db.query('INSERT INTO users (name,email,password) VALUES ($1,$2,$3) RETURNING id,name,email',[name || null,email,hashedPassword]);
            return res.status(201).json({message: 'Account created successfully!',user:newUser.rows[0]})
        }

        else{
           const userExist=await db.query('SELECT * FROM users WHERE email=$1',[email])
           if(userExist.rows.length==0){
                res.status(400).json({message: 'Email does not exist'})
           }
           const hashedPassword=userExist.rows[0].password 
           const correctPassword=await bcrypt.compare(password,hashedPassword)
           if(!correctPassword){
            res.status(400).json({message: 'Invalid credentials.'})
           }
           return res.status(200).json({
            message: 'Logged in successfully!',
            user: { id: user.id, name: user.name, email: user.email }
        });
        }

    }catch(err){
        res.status(500).json({message: 'Authentication error. ',error:err.message})
    }
}

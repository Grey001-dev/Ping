
import db from "../config/db.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const handleauth=async(req,res)=>{
    const {isSignUp,name,email,password,}=req.body;
    if(!email || !password){
        return res.status(400).json({message:"Email and Password required"})
    }
    try{
        if(isSignUp){
            const userExist= await db.query('SELECT * FROM users WHERE email = $1',[email])
            if(userExist.rows.length>0){
                return res.status(400).json({message :'Email is already registered'})
            }
            const salt=await bcrypt.genSalt(10)
            const hashedPassword=await bcrypt.hash(password,salt);

            const newUser=await db.query('INSERT INTO users (name,email,password) VALUES ($1,$2,$3) RETURNING id,name,email',[name || null,email,hashedPassword]);
            const token=jwt.sign({id:newUser.rows[0].id},
                                    process.env.JWT_SECRET,
                                    {expiresIn:'24h'}
                                )
            return res.status(201).json({message: 'Account created successfully!',token,user:newUser.rows[0]})
        }

        else{
           const userExist=await db.query('SELECT * FROM users WHERE email=$1',[email])
           if(userExist.rows.length==0){
               return res.status(400).json({message: 'Email does not exist'})
           }
           const dbUser=userExist.rows[0]
           const hashedPassword=userExist.rows[0].password 
           const correctPassword=await bcrypt.compare(password,hashedPassword)
           if(!correctPassword){
            return res.status(400).json({message: 'Invalid credentials.'})
           }
           const token=jwt.sign({id:userExist.rows[0].id},process.env.JWT_SECRET,{expiresIn:'24h'})
           return res.status(200).json({
            message: 'Logged in successfully!',
            token,
            user: { id: dbUser.id, name: dbUser.name, email: dbUser.email }
        });
        }

    }catch(err){
        res.status(500).json({message: 'Authentication error. ',error:err.message})
    }
}

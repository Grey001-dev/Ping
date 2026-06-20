import jwt from 'jsonwebtoken';
import dotenv from "dotenv"

export const verifyToken=(req,res,next)=>{
    const authHeader=req.headers['authorization'];
    const token=authHeader && authHeader.split(' ')[1]

    if(!token){
        return res.status(401).json({message: 'No token, access denied'})
    }
    try{
        const decoded=jwt.verify(token, process.env.JWT_SECRET);
        req.user=decoded;
        next()
    }catch(err){
        return res.status(401).json({message:'Invalid token'});
    }

}
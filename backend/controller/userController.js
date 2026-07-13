
import prisma from '../config/prisma.js'

export const getUser=async(req,res)=>{
    const userId=req.user.id
    try {

        const user =await prisma.users.findUnique({
            where:{id:userId},
            select:{
                id:true,
                name:true,
                email:true,
                notification_email:true
            }
        })
        if(!user){
            return res.status(404).json({messge:'User not found'})
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({message:'Error fetching user',error:err.message})
        
    }
}

export const updateNotificationEmail=async(req,res)=>{
    const {notification_email}=req.body;
    try {
        const user=await prisma.users.update({
            where:{id:req.user.id},
            data:{notification_email:notification_email || null},
            select:{
                id:true,
                name:true,
                email:true,
                notification_email:true
            }
        })
        res.status(200).json(user)
    } catch (err) {
        console.log(err)
        res.status(500).json({message:'Error updating notification',error:err.message})
    }
}
import db from '../config/db.js'

export const getUser=async(req,res)=>{
    const userId=req.user.id
    try {
        const result=await db.query(
            'SELECT id,name,email,notification_email FROM users WHERE id=$1',
            [userId]
        );
        if(result.rows.length===0){
            return res.status(404).json({message:'User not found'})
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({message:'Error fetching user',error:err.message})
        
    }
}

export const updateNotificationEmail=async(req,res)=>{
    const {notification_email}=req.body;
    try {
        const result=await db.query(
            'UPDATE users SET notification_email=$1 WHERE id=$2 RETURNING id,name,email,notification_email',
            [notification_email || null,req.user.id]
        )
        res.status(200).json(result.rows[0])
    } catch (err) {
        res.status(500).json({message:'Error updating notification',error:err.message})
    }
}
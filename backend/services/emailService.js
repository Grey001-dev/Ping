import {Resend} from 'resend'
import dotenv from 'dotenv'
dotenv.config()

const resend=new Resend(process.env.RESEND_API_KEY)
export async function sendDownEmail(monitor,userEmail){
    try{
        await resend.emails.send({
            from:'onboarding@resend.dev',
            to:userEmail,
            subject:`🔴 ${monitor.name} is down`,
            html:`
                <div style="font-family: sans-serif; max-width:480px; margin: 0 auto; padding:24px; background:#0a0a0f; color: #faf5f9;
                border-radius:12px;">
                    <h2 style="color: #e36262; margin: 0 0 8px;">🔴 ${monitor.name} is down </h2>
                    <p style="color: rgba(255,255,255,0.5); font-size:13px; margin:0 0 24px;">We detected an issue with your monitor</p>

                    <div style="background : #111118; border:1px solid #1e1e2e; border-radius:8px; padding:16px; margin-bottom:16px;">
                        <p style="margin:0 0 8px; font-size:13px;"><strong>Monitor:</strong> ${monitor.name}</p>
                        <p style="margin:0 0 8px; font-size:13px;"><strong>URL:</strong>${monitor.url}</p>
                        <p style="margin:0; font-size: 13px;"><strong>Time:</strong>${new Date().toLocaleString()}</p>
                    </div>
                    <p style="color:rgba(255,255,255,0.3); font-size:11px; margin:0;">You are receiving this because you have an active monitor on Ping.</p>
                </div>
                `
        });
        console.log(`Down alert sent to ${userEmail} for ${monitor.name}`)
    }catch(err){
        console.error('Error sending down email:',err.message)
    }
}

export async function sendRecoveryEmail(monitor,userEnmail){
    try{
        await resend.emails.send({
            from:`onboarding@resend.dev`,
            to:userEmail,
            subject:` 🟢 ${monitor.name} is back up!!`,
            html:`
            <div style="font-family:sans-serif; max-width:480px;margin:0 auto; padding:24px; background:#0a0a0f ; color:#faf5f9; border-radius:12px;">
                <h2 style"color:green; margin:0 0 8px;"> 🟢 ${monitor.name} is up!!!</h2>
                <p style="color:rgba(255,255,255,0.5); font-size:13px; margin:0 0 24px;">We detected an issue with your monitor</p>

                <div style="background: #111118; border:1px solid #1e1e2e; border-radius:8px; padding:16px; margin-bottom:16px;">
                    <p style="margin:0 0 8px; font-size:13px;"><strong>Monitor:</strong>${monitor.name}</p>
                    <p style="margin:0 0 8px; font-size:13px;"><strong>URL:</strong>${monitor.url}</p>
                    <p style="margin:0;font-size:13px;"><strong>Time:</strong>${new Date().toLocaleString()}</p>
                </div>
                <p style="color:rgba(255,255,255,0.3); font-size:11px;margin:0;">You are receiving this because you have an active monitor on Ping.</p>
            </div>
            `
        });
        console.log(`Down alert sent to ${userEmail} for ${monitor.name}`)
    }catch(err){
        console.error(`Error sending down email:`,err.message)
    }
}
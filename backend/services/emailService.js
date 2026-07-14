import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import dns from 'dns'
dotenv.config()
import * as Brevo from '@getbrevo/brevo'

// const transporter=nodemailer.createTransport({
//     host:'smtp.gmail.com',
//     port:465,
//     secure:false,
//     auth:{
//         user:process.env.GMAIL_USER,
//         pass:process.env.GMAIL_APP_PASSWORD
//     }
// });

// transporter.verify((error,success)=>{
//     if(error){
//         console.log('Transporter verification FAILED:',error)
//     }else{
//         console.log('Transporter is ready to send emails')
//     }
// });

const apiInstance=new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY)
try {
    if(!process.env.BREVO_API_KEY || !process.env.SENDER_EMAIL){
        console.log(`Email Configuration FAILED: missing environment variables`)
    }else{
        console.log('Email client is ready to transmit API requests')
    }
} catch (error) {
    console.log('Email client initialization failed',error.message)
    
}

// export async function sendDownEmail(monitor, userEmail) {
//     try {
//         await transporter.sendMail({
//             from: `"Ping Alerts" <${process.env.GMAIL_USER}>`,
//             to: userEmail,
//             subject: `🔴 ${monitor.name} is down`,
//             html: `
//                 <div style="font-family: sans-serif; max-width:480px; margin: 0 auto; padding:24px; background:#0a0a0f; color: #faf5f9; border-radius:12px;">
//                     <h2 style="color: #e36262; margin: 0 0 8px;">🔴 ${monitor.name} is down</h2>
//                     <p style="color: rgba(255,255,255,0.5); font-size:13px; margin:0 0 24px;">We detected an issue with your monitor</p>
//                     <div style="background: #111118; border:1px solid #1e1e2e; border-radius:8px; padding:16px; margin-bottom:16px;">
//                         <p style="margin:0 0 8px; font-size:13px;"><strong>Monitor:</strong> ${monitor.name}</p>
//                         <p style="margin:0 0 8px; font-size:13px;"><strong>URL:</strong> ${monitor.url}</p>
//                         <p style="margin:0; font-size:13px;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
//                     </div>
//                     <p style="color:rgba(255,255,255,0.3); font-size:11px; margin:0;">You are receiving this because you have an active monitor on Ping.</p>
//                 </div>
//             `
//         });
//         console.log(`Down alert sent to ${userEmail} for ${monitor.name}`);
//     } catch (err) {
//         console.error('Error sending down email:', err.message);
//     }
// }

// export async function sendRecoveryEmail(monitor, userEmail) {
//     try {
//         await transporter.sendMail({
//             from: `"Ping Alerts" <${process.env.GMAIL_USER}>`,
//             to: userEmail,
//             subject: `🟢 ${monitor.name} is back up!!`,
//             html: `
//                 <div style="font-family:sans-serif; max-width:480px; margin:0 auto; padding:24px; background:#0a0a0f; color:#faf5f9; border-radius:12px;">
//                     <h2 style="color:#4ade80; margin:0 0 8px;">🟢 ${monitor.name} is up!!!</h2>
//                     <p style="color:rgba(255,255,255,0.5); font-size:13px; margin:0 0 24px;">Your monitor has recovered</p>
//                     <div style="background: #111118; border:1px solid #1e1e2e; border-radius:8px; padding:16px; margin-bottom:16px;">
//                         <p style="margin:0 0 8px; font-size:13px;"><strong>Monitor:</strong> ${monitor.name}</p>
//                         <p style="margin:0 0 8px; font-size:13px;"><strong>URL:</strong> ${monitor.url}</p>
//                         <p style="margin:0; font-size:13px;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
//                     </div>
//                     <p style="color:rgba(255,255,255,0.3); font-size:11px; margin:0;">You are receiving this because you have an active monitor on Ping.</p>
//                 </div>
//             `
//         });
//         console.log(`Recovery alert sent to ${userEmail} for ${monitor.name}`);
//     } catch (err) {
//         console.error('Error sending recovery email:', err.message);
//     }
// }

export async function sendDownEmail(monitor, userEmail) {
    try {
        const sendSmtpEmail = new Brevo.SendSmtpEmail(); // Brevo names this object "SendSmtpEmail", but it sends over standard HTTP REST API
        
        sendSmtpEmail.subject = `🔴 ${monitor.name} is down`;
        sendSmtpEmail.sender = { name: "Ping Alerts", email: process.env.SENDER_EMAIL };
        sendSmtpEmail.to = [{ email: userEmail }];
        sendSmtpEmail.htmlContent = `
            <div style="font-family: sans-serif; max-width:480px; margin: 0 auto; padding:24px; background:#0a0a0f; color: #faf5f9; border-radius:12px;">
                <h2 style="color: #e36262; margin: 0 0 8px;">🔴 ${monitor.name} is down</h2>
                <p style="color: rgba(255,255,255,0.5); font-size:13px; margin:0 0 24px;">We detected an issue with your monitor</p>
                <div style="background: #111118; border:1px solid #1e1e2e; border-radius:8px; padding:16px; margin-bottom:16px;">
                    <p style="margin:0 0 8px; font-size:13px;"><strong>Monitor:</strong> ${monitor.name}</p>
                    <p style="margin:0 0 8px; font-size:13px;"><strong>URL:</strong> ${monitor.url}</p>
                    <p style="margin:0; font-size:13px;"><strong>Time:</strong> ${new Date().toISOString()}</p>
                </div>
                <p style="color:rgba(255,255,255,0.3); font-size:11px; margin:0;">You are receiving this because you have an active monitor on Ping.</p>
            </div>
        `;

        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`Down alert safely sent via API to ${userEmail} for ${monitor.name}`);
    } catch (err) {
        console.error('Error sending down email via Brevo:', err.message);
    }
}

export async function sendRecoveryEmail(monitor, userEmail) {
    try {
        const sendSmtpEmail = new Brevo.SendSmtpEmail();
        
        sendSmtpEmail.subject = `🟢 ${monitor.name} is back up!!`;
        sendSmtpEmail.sender = { name: "Ping Alerts", email: process.env.SENDER_EMAIL };
        sendSmtpEmail.to = [{ email: userEmail }];
        sendSmtpEmail.htmlContent = `
            <div style="font-family:sans-serif; max-width:480px; margin:0 auto; padding:24px; background:#0a0a0f; color:#faf5f9; border-radius:12px;">
                <h2 style="color:#4ade80; margin:0 0 8px;">🟢 ${monitor.name} is up!!!</h2>
                <p style="color:rgba(255,255,255,0.5); font-size:13px; margin:0 0 24px;">Your monitor has recovered</p>
                <div style="background: #111118; border:1px solid #1e1e2e; border-radius:8px; padding:16px; margin-bottom:16px;">
                    <p style="margin:0 0 8px; font-size:13px;"><strong>Monitor:</strong> ${monitor.name}</p>
                    <p style="margin:0 0 8px; font-size:13px;"><strong>URL:</strong> ${monitor.url}</p>
                    <p style="margin:0; font-size:13px;"><strong>Time:</strong> ${new Date().toISOString()}</p>
                </div>
                <p style="color:rgba(255,255,255,0.3); font-size:11px; margin:0;">You are receiving this because you have an active monitor on Ping.</p>
            </div>
        `;

        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`Recovery alert safely sent via API to ${userEmail} for ${monitor.name}`);
    } catch (err) {
        console.error('Error sending recovery email via Brevo:', err.message);
    }
}
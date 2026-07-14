import dotenv from 'dotenv';
import { BrevoClient } from '@getbrevo/brevo';

dotenv.config();
const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});
try {
    if (!process.env.BREVO_API_KEY || !process.env.SENDER_EMAIL) {
        console.log(`Email Configuration FAILED: missing environment variables`);
    } else {
        console.log('Email client is ready to transmit API requests');
    }
} catch (error) {
    console.log('Email client initialization failed:', error.message);
}

export async function sendDownEmail(monitor, userEmail) {
    try {
        await brevo.transactionalEmails.sendTransacEmail({
            subject: `🔴 ${monitor.name} is down`,
            sender: { 
                name: "Ping Alerts", 
                email: process.env.SENDER_EMAIL 
            },
            to: [{ email: userEmail }],
            htmlContent: `
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
            `
        });
        console.log(`Down alert safely sent via Brevo to ${userEmail} for ${monitor.name}`);
    } catch (err) {
        console.error('Error sending down email via Brevo:', err.message);
    }
}

export async function sendRecoveryEmail(monitor, userEmail) {
    try {
        await brevo.transactionalEmails.sendTransacEmail({
            subject: `🟢 ${monitor.name} is back up!!`,
            sender: { 
                name: "Ping Alerts", 
                email: process.env.SENDER_EMAIL 
            },
            to: [{ email: userEmail }],
            htmlContent: `
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
            `
        });
        console.log(`Recovery alert safely sent via Brevo to ${userEmail} for ${monitor.name}`);
    } catch (err) {
        console.error('Error sending recovery email via Brevo:', err.message);
    }
}


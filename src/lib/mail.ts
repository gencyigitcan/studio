import nodemailer from 'nodemailer';

// Use environment variables for real implementation
// For MVP/Demo, we could use Ethereal (fake SMTP) or just log to console if no creds
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
        user: process.env.SMTP_USER || 'ethereal_user',
        pass: process.env.SMTP_PASS || 'ethereal_pass',
    },
});

export async function sendEmail(to: string, subject: string, html: string) {
    if (!process.env.SMTP_HOST) {
        console.log('---------------------------------------------------');
        console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
        console.log(html);
        console.log('---------------------------------------------------');
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: '"Pilates Studio" <no-reply@pilates.com>',
            to,
            subject,
            html,
        });
        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

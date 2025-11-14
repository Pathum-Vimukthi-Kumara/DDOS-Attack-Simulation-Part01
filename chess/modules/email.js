import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

let transporter = null
const emailUser = process.env.EMAIL_USER
const emailPass = process.env.EMAIL_PASS

if (emailUser && emailPass) {
    transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
            type: 'login',
            user: emailUser,
            pass: emailPass,
        },
    })
} else {
    console.log('> Email disabled: missing EMAIL_USER/EMAIL_PASS')
}

export function sendEmail(to, subject, text) {
    if (!transporter) return // email not configured; safely no-op
    transporter.sendMail(
        {
            from: emailUser,
            to,
            subject,
            text,
        },
        (err) => {
            if (err) console.log(err)
        }
    )
}

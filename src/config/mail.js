const nodemailer = require("nodemailer");
require("dotenv").config();

function sendMail(emailReceiver, token) {
    const configMail = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.NODEMAILER_EMAIL_ADDRESS,
            pass: process.env.NODEMAILER_EMAIL_PASSWORD,
        },
    });

    // Content
    configMail.sendMail({
        from: process.env.NODEMAILER_EMAIL_ADDRESS,
        to: emailReceiver,
        subject: "Example App Activation Link",
        html: `<b>${process.env.FRONTEND_URL}/user/verify?token=${token}</b>`,
    });
    return;
}

module.exports = {
    sendMail,
};

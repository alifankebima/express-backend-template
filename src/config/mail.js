const nodemailer = require("nodemailer");
require("dotenv").config();

const configMail = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.NODEMAILER_EMAIL_ADDRESS,
        pass: process.env.NODEMAILER_EMAIL_PASSWORD,
    },
});

const sendMail = (emailReceiver, token, message) => {
    configMail.sendMail({
        from: process.env.NODEMAILER_EMAIL_ADDRESS,
        to: emailReceiver,
        subject: message,
        html: `<b>${process.env.NODEMAILER_FRONTEND_URL}/user/verify?token=${token}</b>`,
    });
    return;
}

const sendForgotPassword = (emailReceiver, token, message) => {
    configMail.sendMail({
        from: process.env.NODEMAILER_EMAIL_ADDRESS,
        to: emailReceiver,
        subject: message,
        html: `<b>${process.env.NODEMAILER_FRONTEND_URL}/user/reset-password?token=${token}</b>`,
    });
    return;
}

module.exports = {
    sendMail,
    sendForgotPassword
};

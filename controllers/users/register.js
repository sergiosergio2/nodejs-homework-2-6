const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");
const sgMail = require("@sendgrid/mail");
const gravatar = require('gravatar');
const bcrypt = require('bcrypt');
const { User } = require("../../models");

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const register = async (req, res, next) => {
    const { email, password } = req.body;
    const verificationToken = uuidv4();
const port = process.env.PORT;
    const msg = {
        to: email,
        from: "vzdor5555@gmail.com",
        subject: "Register user contacts API",
        text: `confirm your registration by following the link http://localhost:${port}/api/users/verify/${verificationToken}`,
        html: `<strong>confirm your registration by following the link http://localhost:${port}/api/users/verify/${verificationToken}</strong>`,
    };
    const avatarURL = gravatar.url(email);
    
    try {
        const result = await User.create({
            email,
            password: await bcrypt.hash(password, 10),
            avatarURL,
            verificationToken,
        });
        await sgMail.send(msg);
        res.status(201).json({
            user: {
                email: result.email,
                subscription: result.subscription,
            },
        });
    } catch (e) {
        if (e.code === 11000) {
            e.status = 409;
            e.message = "Email in use";
        }
        next(e);
    }
};

module.exports = register;
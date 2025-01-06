const { sequelize } = require('sequelize');
const Account = require('../models/account')
const UserOtp = require('../models/user_otp')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { default: transporter } = require('../config/nodemailer');
require('dotenv').config();

const signup = async (req, res) => {
    
    const { username, email, password } = req.body;

    const transaction = await sequelize.transaction();

    try {
        if(!username || !email || !password){
            return res.json({success: false, message: 'Missing User Information'});
        }

        const usernameExists = await Account.findOne({where: {username}});
        if(usernameExists){
            return res.json({success: false, message: 'UserName already exists'});
        }

        const emailExists = await Account.findOne({where: {email}});
        if(emailExists){
            return res.json({success: false, message: 'Email already exists'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await Account.create(
            {
                username,
                email,
                password: hashedPassword
            }
        )
        if(!user){
            return res.json({success: false, message: 'Unable to create account'});
        }

        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        await transaction.commit();

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to TakeReview',
            text: `Welcome to TakeReview. Your account is created with emailid ${email}`
        }

        await transporter.sendMail(mailOptions);

        return res.json({success: true, message: 'User created successfully'})

    } catch (error){
        await transaction.rollback();
        return res.json({success: false, message: error.message})
    }

}

const login = async (req, res) => {
    const { email, password } = req.body;

    const transaction = sequelize.transaction();

    try{

        const user = await Account.findOne({where : {email}});
        if(!user){
            res.json({success: false, message: 'User Not Found'});
        }

        if(!user.is_verified){
            res.json({success: false, message: 'User Not verified'});
        }

        const isValid = await bcrypt.compare(password, user.password);

        if(!isValid){
            res.json({success: false, message: 'Invalid Password'})
        }

        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        await transaction.commit();

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.json({success: true, message: 'User is validated successfully'})

    } catch (error){
        await transaction.rollback();
        return res.json({success: false, message: error.message})
    }
}

const sendVerificationOtp = async (req, res) => {
    const {userId} = req.body;

    try{
        const user = Account.findOne({
            where: {id: userId},
            includes: [{
                model: UserOtp
            }]
        })
    
        if(user.is_verified){
            return res.json({success: false, message: 'User is already verified'});
        }
    
        const otp = String(Math.floor(100000 + Math.random() * 900000));
    
        const updateUserOtp = UserOtp.create(
            {
                account_id: userId,
                otp,
                deleted_at : Date.now() + 24 * 60 * 60 * 1000
            }
        )
    
        if(!updateUserOtp){
            return res.json({success: false, message: 'Unable to create otp at the moment'});
        }
    
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'TakeReview account verification',
            text: `Your OTP is ${otp}. Verify your account using this OTP`
        }
    
        await WebTransportError.sendMail(mailOption);
    
        res.json({ success: true, message: 'Verification mail is send to the user'});
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

const verifyEmail = async (req, res) => {
    const {userId, otp} = req.body;

    if(!userId || !otp) {
        return res.json({success: false, message: 'Missing Details'});
    }

    try{

        const user = Account.findOne({
            where: {id: userId},
            includes: [{
                model: UserOtp
            }]
        })

        if(!user){
            return res.json({success: false, message: 'User not found'});
        }

        if(user.otp === '' || user.otp !== otp){
            return res.json({success: false, message: 'Otp is invalid'});
        }

        if(user.deleted_at < Date.now()){
            return res.json({success: false, message: 'Otp is expired'});
        }

        const account = Account.update(
            {is_verified: true},
            {
                where: {
                    id:userId
                },
            },
        )

        if(!account){
            return res.json({success: false, message: 'Unable to verify account'});
        }

        return res.json({success: true, message: 'Account is verified successfully'});


    } catch (error){
        return res.json({success: false, message: error.message})
    }
}

module.exports = {
    signup,
    login,
    sendVerificationOtp,
    verifyEmail
}
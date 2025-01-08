const {sequelize} = require('../models/db');
const {Account, UserOtp} = require('../models/db.js');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { transporter } = require('../config/nodemailer');
const api_key_generator = require('../helper/account.js');
require("dotenv").config({ path: require('find-config')('.env') })

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

        await transaction.commit();

        return res.json({success: true, message: 'User created successfully'})

    } catch (error){
        await transaction.rollback();
        return res.json({success: false, message: error.message})
    }

}

const login = async (req, res) => {
    const { email, password } = req.body;

    const transaction = await sequelize.transaction();

    try{

        const user = await Account.findOne({where : {email}});
        if(!user){
            return res.json({success: false, message: 'User Not Found'});
        }

        if(!user.is_verified){
            return res.json({success: false, message: 'User Not verified'});
        }

        const isValid = await bcrypt.compare(password, user.password);

        if(!isValid){
            return res.json({success: false, message: 'Invalid Password'})
        }

        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        await transaction.commit();

        return res.json({success: true, message: 'User is logged in successfully'})

    } catch (error){
        await transaction.rollback();
        return res.json({success: false, message: error.message})
    }
}

const sendVerificationOtp = async (req, res) => {
    const {userId} = req.body;

    const transaction = await sequelize.transaction();

    try{
        const user = await Account.findOne({
            where: {id: userId},
        })

        const conditon = user.dataValues.is_verified;

        if(conditon){
            console.log(conditon)
            return res.json({success: false, message: 'User is already verified'});
        }
    
        const otp = String(Math.floor(100000 + Math.random() * 900000));
    
        const updateUserOtp = await UserOtp.create(
            {
                account_id: userId,
                otp,
                expired_at : Date.now() + 24 * 60 * 60 * 1000
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
    
        await transporter.sendMail(mailOption);

        await transaction.commit();
    
        return res.json({ success: true, message: 'Verification mail is send to the user'});
    } catch (error) {
        await transaction.rollback();
        res.json({ success: false, message: error.message });
    }
}

const verifyEmail = async (req, res) => {
    const {userId, otp} = req.body;

    if(!userId || !otp) {
        return res.json({success: false, message: 'Missing Details'});
    }

    const transaction = await sequelize.transaction();

    try{
        
        const user = await UserOtp.findOne({
            where: { account_id: userId },
        });

        if(!user){
            return res.json({success: false, message: 'User not found'});
        }

        if(user.otp === '' || user.otp !== otp){
            return res.json({success: false, message: 'Otp is invalid'});
        }

        if(user.expired_at < Date.now()){
            return res.json({success: false, message: 'Otp is expired'});
        }

        const userKey = await api_key_generator();

        const account = await Account.update(
            {
                is_verified: true,
                api_key: userKey
            },

            {
                where: {
                    id:userId
                },
            },
        )

        if(!account){
            return res.json({success: false, message: 'Unable to verify account'});
        }

        await transaction.commit();

        return res.json({success: true, message: 'Account is verified successfully'});

    } catch (error){
        await transaction.rollback();
        return res.json({success: false, message: error.message});
    }
}

module.exports = {
    signup,
    login,
    sendVerificationOtp,
    verifyEmail
}
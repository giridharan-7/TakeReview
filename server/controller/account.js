const { sequelize } = require('sequelize');
const Account = require('../models/account')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
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

const verify = async (req, res) => {
    return true;
}

module.exports = {
    signup,
    verify,
    login
}
const {sequelize, Datatypes} = require('sequelize');
const AccountModel = require('./models/account');
const UserOtpModel = require('./models/user_otp');

const sequelize = new sequelize('TakeReview', 'Giridharan', 'Giridev1729!', {
    host: '127.0.0.1',
    dialect: 'postgres'
})

const Account = AccountModel(sequelize, Datatypes);
const UserOtp = UserOtpModel(sequelize, Datatypes);

UserOtp.belongsTo(Account, { foreignKey: 'account_id' });

sequelize.sync({ alter:true })
    then(() => {
        console.log("Database is connected");
    }).catch((error) => {
        console.log("Error while connecting to database", error);
    });

module.exports = { sequelize, Account, UserOtp }
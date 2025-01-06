const {Sequelize, DataTypes} = require('sequelize');
const AccountModel = require('./models/account');
const UserOtpModel = require('./models/user_otp');

const sequelize = new Sequelize('TakeReview', 'Giridharan', 'Giridev1729!', {
    host: '127.0.0.1',
    dialect: 'postgres'
})

const Account = AccountModel(sequelize, DataTypes);
const UserOtp = UserOtpModel(sequelize, DataTypes);

UserOtp.belongsTo(Account, { foreignKey: 'account_id' });

sequelize.sync({ force:false })
    .then(() => {
        console.log("Database is connected");
    }).catch((error) => {
        console.log("Error while connecting to database", error);
    });

module.exports = { sequelize, Account, UserOtp }
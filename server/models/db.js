const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('TakeReview', 'Giridharan', 'Giridev1729!', {
    host: '127.0.0.1',
    dialect: 'postgres',
});

const Account = sequelize.define('Account', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_verified: {
        type: DataTypes.STRING,
        defaultValue: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'account',
    timestamps: false
});

const UserOtp = sequelize.define('UserOtp', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    account_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    otp: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    expired_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'user_otp',
    timestamps: false
});

UserOtp.belongsTo(Account, { foreignKey: 'account_id' });

sequelize.sync({ force: false })
    .then(() => console.log('Database connected'))
    .catch((error) => console.error('Database connection error:', error));

module.exports = { sequelize, Account, UserOtp };
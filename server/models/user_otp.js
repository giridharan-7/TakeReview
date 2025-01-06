module.exports = (sequelize, DataTypes) => {
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
            type: DataTypes.INTEGER,
            defaultValue: DataTypes.NOW,
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'user_otp',
        timestamps: false
    });
    return UserOtp;
};
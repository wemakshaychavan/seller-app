module.exports = (sequelize, DataTypes) => {
    const ConfirmRequest = sequelize.define('ConfirmRequest', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        transactionId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        providerId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        orderId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        retailOrderId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        selectedLogistics: {
            type: DataTypes.JSONB,
            allowNull: true
        }

    }, {
        freezeTableName: true
    });


    return ConfirmRequest;
};

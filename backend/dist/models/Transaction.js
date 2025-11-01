"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Transaction extends sequelize_1.Model {
}
Transaction.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    amountInUSD: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
    },
    entityId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    entity: {
        type: sequelize_1.DataTypes.ENUM('subscription', 'kyc'),
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('initialized', 'pending', 'successful', 'failed'),
        allowNull: false,
        defaultValue: 'initialized',
    },
    minerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.default,
    tableName: 'transactions',
    modelName: 'Transaction',
});
exports.default = Transaction;

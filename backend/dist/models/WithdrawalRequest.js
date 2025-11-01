"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/Withdrawal.ts
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Withdrawal extends sequelize_1.Model {
}
Withdrawal.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    minerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'miners',
            key: 'id',
        },
    },
    subscriptionId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'mining_subscriptions',
            key: 'id',
        },
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('deposit', 'earnings'),
        allowNull: false,
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    currency: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'USD',
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'approved', 'rejected', 'processing', 'completed'),
        allowNull: false,
        defaultValue: 'pending',
    },
    rejectionReason: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    transactionHash: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    processedBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
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
    tableName: 'withdrawals',
    modelName: 'Withdrawal',
});
exports.default = Withdrawal;

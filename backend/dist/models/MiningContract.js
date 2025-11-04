"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class MiningContract extends sequelize_1.Model {
}
MiningContract.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    miningServerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'mining_servers',
            key: 'id',
        },
    },
    periodReturn: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    period: {
        type: sequelize_1.DataTypes.ENUM('daily', 'weekly', 'fortnightly', 'monthly'),
        allowNull: false,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
    minimumDeposit: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize: database_1.default,
    tableName: 'mining_contracts',
    modelName: 'MiningContract',
});
exports.default = MiningContract;

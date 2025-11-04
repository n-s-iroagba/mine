"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sequelize = process.env.NODE_ENV ? new sequelize_1.Sequelize(process.env.DB_URI) : new sequelize_1.Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME || 'crypto',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '97chocho',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    define: {
        timestamps: true,
        underscored: true,
    },
});
exports.default = sequelize;

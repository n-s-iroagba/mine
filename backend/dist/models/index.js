"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KYCFee = exports.KYC = exports.Transaction = exports.MiningSubscription = exports.Bank = exports.MiningContract = exports.MiningServer = exports.AdminWallet = exports.User = void 0;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const AdminWallet_1 = __importDefault(require("./AdminWallet"));
exports.AdminWallet = AdminWallet_1.default;
const MiningServer_1 = __importDefault(require("./MiningServer"));
exports.MiningServer = MiningServer_1.default;
const MiningContract_1 = __importDefault(require("./MiningContract"));
exports.MiningContract = MiningContract_1.default;
const Bank_1 = __importDefault(require("./Bank"));
exports.Bank = Bank_1.default;
const MiningSubscription_1 = __importDefault(require("./MiningSubscription"));
exports.MiningSubscription = MiningSubscription_1.default;
const Transaction_1 = __importDefault(require("./Transaction"));
exports.Transaction = Transaction_1.default;
const KYC_1 = __importDefault(require("./KYC"));
exports.KYC = KYC_1.default;
const KYCFee_1 = __importDefault(require("./KYCFee"));
exports.KYCFee = KYCFee_1.default;
const Miner_1 = __importDefault(require("./Miner"));
// MiningContract - MiningServer relationship
MiningContract_1.default.belongsTo(MiningServer_1.default, {
    foreignKey: 'miningServerId',
    as: 'miningServer',
});
MiningServer_1.default.hasMany(MiningContract_1.default, {
    foreignKey: 'miningServerId',
    as: 'miningContracts',
});
// MiningSubscription relationships
MiningSubscription_1.default.belongsTo(MiningContract_1.default, {
    foreignKey: 'miningContractId',
    as: 'miningContract',
});
MiningContract_1.default.hasMany(MiningSubscription_1.default, {
    foreignKey: 'miningContractId',
    as: 'subscriptions',
});
MiningSubscription_1.default.belongsTo(User_1.default, {
    foreignKey: 'minerId',
    as: 'miner',
});
User_1.default.hasMany(MiningSubscription_1.default, {
    foreignKey: 'minerId',
    as: 'subscriptions',
});
Miner_1.default.belongsTo(User_1.default, {
    foreignKey: 'userId',
    as: 'user',
});
User_1.default.hasMany(Miner_1.default, {
    foreignKey: 'userId',
    // as: 'subscriptions',
});
// Transaction relationships
Transaction_1.default.belongsTo(User_1.default, {
    foreignKey: 'minerId',
    as: 'miner',
});
User_1.default.hasMany(Transaction_1.default, {
    foreignKey: 'minerId',
    as: 'transactions',
});
// KYC relationships
KYC_1.default.belongsTo(User_1.default, {
    foreignKey: 'minerId',
    as: 'miner',
});
User_1.default.hasOne(KYC_1.default, {
    foreignKey: 'minerId',
    as: 'kyc',
});
KYC_1.default.belongsTo(User_1.default, {
    foreignKey: 'reviewedBy',
    as: 'reviewer',
});
User_1.default.hasMany(KYC_1.default, {
    foreignKey: 'reviewedBy',
    as: 'reviewedKycs',
});
// KYCFee relationships
KYCFee_1.default.belongsTo(User_1.default, {
    foreignKey: 'minerId',
    as: 'miner',
});
User_1.default.hasOne(KYCFee_1.default, {
    foreignKey: 'minerId',
    as: 'kycFee',
});

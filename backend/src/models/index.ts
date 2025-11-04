import User from './User';
import AdminWallet from './AdminWallet';
import MiningServer from './MiningServer';
import MiningContract from './MiningContract';
import Bank from './Bank';
import MiningSubscription from './MiningSubscription';
import Transaction from './Transaction';
import KYC from './KYC';
import KYCFee from './KYCFee';
import Miner from './Miner';

// MiningContract - MiningServer relationship
MiningContract.belongsTo(MiningServer, {
  foreignKey: 'miningServerId',
  as: 'miningServer',
});

MiningServer.hasMany(MiningContract, {
  foreignKey: 'miningServerId',
  as: 'miningContracts',
});
MiningSubscription.hasMany(Transaction, {
  foreignKey: 'entityId',
  constraints: false,
  scope: {
    entity: 'subscription',
  },
  as: 'transactions',
});

Transaction.belongsTo(MiningSubscription, {
  foreignKey: 'entityId',
  constraints: false,
  as: 'subscription',
});  MiningSubscription.belongsTo(Miner, {
    foreignKey: 'minerId',
    as: 'miner',
  });

  // MiningContract - MiningSubscription association (One-to-Many)
  MiningContract.hasMany(MiningSubscription, {
    foreignKey: 'miningContractId',
    as: 'subscriptions',
  });
// MiningSubscription relationships
MiningSubscription.belongsTo(MiningContract, {
  foreignKey: 'miningContractId',
  as: 'miningContract',
});

MiningContract.hasMany(MiningSubscription, {
  foreignKey: 'miningContractId',
  
});


Miner.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(Miner, {
  foreignKey: 'userId',
  // as: 'subscriptions',
});
// Transaction relationships
Transaction.belongsTo(User, {
  foreignKey: 'minerId',
  as: 'miner',
});

User.hasMany(Transaction, {
  foreignKey: 'minerId',
  as: 'transactions',
});

// KYC relationships
KYC.belongsTo(User, {
  foreignKey: 'minerId',
  as: 'miner',
});

User.hasOne(KYC, {
  foreignKey: 'minerId',
  as: 'kyc',
});

KYC.belongsTo(User, {
  foreignKey: 'reviewedBy',
  as: 'reviewer',
});

User.hasMany(KYC, {
  foreignKey: 'reviewedBy',
  as: 'reviewedKycs',
});

// KYCFee relationships
KYCFee.belongsTo(User, {
  foreignKey: 'minerId',
  as: 'miner',
});

User.hasOne(KYCFee, {
  foreignKey: 'minerId',
  as: 'kycFee',
});

export {
  User,
  AdminWallet,
  MiningServer,
  MiningContract,
  Bank,
  MiningSubscription,
  Transaction,
  KYC,
  KYCFee,
};
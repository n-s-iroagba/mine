export const API_ROUTES = {
  // Auth Routes
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP_ADMIN: '/auth/signup/admin',
    SIGNUP_MINER: '/auth/signup/miner',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION_CODE: '/auth/resend-verification-code',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH_ACCESS_TOKEN: '/auth/refresh-token'
  },

  // User Routes
  users: {
    getAll: '/users',
    getMiners: '/users/miners',
    getAdmins: '/users/admins',
    getById: (id: number) => `/users/${id}`,
    update: (id: number) => `/users/${id}`,
    deactivate: (id: number) => `/users/${id}/deactivate`,
    activate: (id: number) => `/users/${id}/activate`,
  },

    withdrawals: {
    create: '/withdrawals',
    getMinerWithdrawals: (minerId: number) => `/withdrawals/miner/${minerId}`,
    getAll: '/withdrawals/admin/all',
    getAllWithStatus: (status: string) => `/withdrawals/admin/all?status=${status}`,
    getById: (id: number) => `/withdrawals/${id}`,
    updateStatus: (id: number) => `/withdrawals/admin/${id}/status`,
    cancel: (id: number) => `/withdrawals/${id}/cancel`,
    stats: '/withdrawals/admin/stats',
  },

  // Admin Wallet Routes
  adminWallets: {
    getAll: '/admin-wallets',
    getActive: '/admin-wallets/active',
    getById: (id: number) => `/admin-wallets/${id}`,
    create: '/admin-wallets',
    update: (id: number) => `/admin-wallets/${id}`,
    delete: (id: number) => `/admin-wallets/${id}`,
  },

  // Mining Server Routes
  miningServers: {
    getAll: '/mining-servers',
    getWithContracts: '/mining-servers/with-contracts',
    getById: (id: number) => `/mining-servers/${id}`,
    create: '/mining-servers',
    update: (id: number) => `/mining-servers/${id}`,
    delete: (id: number) => `/mining-servers/${id}`,
  },

  // Mining Contract Routes
  miningContracts: {
    getAll: '/mining-contracts',
    getByServerId: (serverId: number) => `/mining-contracts/server/${serverId}`,
    getByPeriod: (period: string) => `/mining-contracts/period/${period}`,
    getById: (id: number) => `/mining-contracts/${id}`,
    create: '/mining-contracts',
    update: (id: number) => `/mining-contracts/${id}`,
    delete: (id: number) => `/mining-contracts/${id}`,
  },

  // Bank Routes
  banks: {
    getAll: '/banks',
    getActive: '/banks/active',
    getById: (id: number) => `/banks/${id}`,
    create: '/banks',
    update: (id: number) => `/banks/${id}`,
    delete: (id: number) => `/banks/${id}`,
  },

    earnings: {
    // Get earnings by subscription ID
    getBySubscriptionId: (subscriptionId: string | number) => 
      `/earnings/subscription/${subscriptionId}`,
    
    // Create new earning
    create: '/earnings',
    
    // Update earning
    update: (id: number) => `/earnings/${id}`,
    
    // Delete earning
    delete: (id: number) => `/earnings/${id}`,
  },

  // Mining Subscription Routes
  subscriptions: {
    getAll: '/subscriptions',
    getByMinerId: (minerId: number) => `/subscriptions/miner/${minerId}`,
    getMinerDashboard: (minerId: number) => `/subscriptions/miner/${minerId}/dashboard`,
    getById: (id: number) => `/subscriptions/${id}`,
      update: (id: number) => `/subscriptions/${id}`,
        updateSubpscriptionPaymentProof: (id: number) => `/subscriptions/payment/${id}`,
        delete: (id: number) => `/subscriptions/${id}`,
    calculateEarnings: (id: number) => `/subscriptions/${id}/calculate-earnings`,
    create: (id:number|string)=>`/subscriptions/${id}`,
    updateEarnings: (id: number) => `/subscriptions/${id}/earnings`,
    deactivate: (id: number) => `/subscriptions/${id}/deactivate`,
    processDailyEarnings: '/subscriptions/process-daily-earnings',
    deposit:(id:number)=>`/subscriptions/deposit/${id}`
  },

  // Transaction Routes
  transactions: {
    getAll: '/transactions',
    getByMinerId: (minerId: number) => `/transactions/miner/${minerId}`,
    getByStatus: (status: string) => `/transactions/status/${status}`,
    getStats: '/transactions/stats/overview',
    getById: (id: number) => `/transactions/${id}`,
    create: '/transactions',
    updateStatus: (id: number) => `/transactions/${id}/status`,
    getBySubId:(subId:string) =>`/transactions/sub/${subId}`
  },

  // KYC Routes
  kyc: {
    getAll: '/kyc',
    getByStatus: (status: string) => `/kyc/status/${status}`,
    getStats: '/kyc/stats/overview',
    getByMinerId: (minerId: number) => `/kyc/miner/${minerId}`,
    getById: (id: number) => `/kyc/${id}`,
    create: '/kyc',
    updateStatus: (id: number) => `/kyc/${id}/status`,
  },
    miners: {
    getAll: '/miners',
    getById: (id: number) => `/miners/${id}`,
    update: (id: number) => `/miners/${id}`,
    delete: (id: number) => `/miners/${id}`,
  },

  // KYC Fee Routes
  kycFees: {
    getAll: '/kyc-fees',
    getUnpaid: '/kyc-fees/unpaid',
    getPaid: '/kyc-fees/paid',
    getStats: '/kyc-fees/stats/overview',
    getByMinerId: (minerId: number) => `/kyc-fees/miner/${minerId}`,
    getById: (id: number) => `/kyc-fees/${id}`,
    create: '/kyc-fees',
    markAsPaid: (id: number) => `/kyc-fees/${id}/mark-paid`,
    submitPaymentProof: (minerId: number) => `/kyc-fees/${minerId}/submit-proof`,

  },

  // Email Routes
  email: {
    send: '/email/send',
    sendBulk: '/email/send-bulk',
    sendToMiners: '/email/send-to-miners',
    sendToAdmins: '/email/send-to-admins',
  },

  // Health Check
  health: '/health',
} as const;

// Type for API routes
export type ApiRoutes = typeof API_ROUTES;

// Helper types for route parameters
export type RouteParams = {
  users: {
    getById: number;
    update: number;
    deactivate: number;
    activate: number;
  };
  adminWallets: {
    getById: number;
    update: number;
    delete: number;
  };
  miningServers: {
    getById: number;
    update: number;
    delete: number;
  };
  miningContracts: {
    getByServerId: number;
    getByPeriod: string;
    getById: number;
    update: number;
    delete: number;
  };
  banks: {
    getById: number;
    update: number;
    delete: number;
  };
  subscriptions: {
    getByMinerId: number;
    getMinerDashboard: number;
    getById: number;
    calculateEarnings: number;
    updateEarnings: number;
    deactivate: number;
  };
  transactions: {
    getByMinerId: number;
    getByStatus: string;
    getById: number;
    updateStatus: number;
  };
  kyc: {
    getByStatus: string;
    getByMinerId: number;
    getById: number;
    updateStatus: number;
  };
  kycFees: {
    getByMinerId: number;
    getById: number;
    markAsPaid: number;
  };
};
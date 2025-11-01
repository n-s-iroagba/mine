export interface MiningServerAttributes {
  id: number
  name: string
  hashRate: string
  powerConsumptionInKwH: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface MiningContractAttributes {
  id: number
  miningServerId: number
  periodReturn: number
  period: "daily" | "weekly" | "fortnightly" | "monthly"
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

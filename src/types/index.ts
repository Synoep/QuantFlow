export interface OrderBookData {
  timestamp: string;
  exchange: string;
  symbol: string;
  asks: [string, string][]; // [price, size]
  bids: [string, string][]; // [price, size]
}

export interface SimulationParams {
  exchange: string;
  asset: string;
  orderType: string;
  quantity: number;
  feeTier: string;
}

export interface SimulationResult {
  timestamp: number;
  quantity: number;
  expectedSlippage: number;
  expectedSlippagePercent: number;
  expectedFees: number;
  expectedFeesPercent: number;
  marketImpact: number;
  marketImpactPercent: number;
  netCost: number;
  netCostPercent: number;
  makerProportion: number;
  internalLatency: number;
}
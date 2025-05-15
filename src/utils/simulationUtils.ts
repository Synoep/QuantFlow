import { OrderBookData, SimulationParams, SimulationResult } from '../types';

// Fee tiers for OKX
const FEE_TIERS = {
  'VIP0': { maker: 0.0008, taker: 0.001 },
  'VIP1': { maker: 0.0007, taker: 0.0009 },
  'VIP2': { maker: 0.0006, taker: 0.0008 },
  'VIP3': { maker: 0.0005, taker: 0.0007 },
  'VIP4': { maker: 0.0004, taker: 0.0006 },
  'VIP5': { maker: 0.0002, taker: 0.0004 },
};

// Constants for the Almgren-Chriss model
const MARKET_IMPACT_CONSTANTS = {
  'BTC-USDT': { temporaryImpact: 0.0001, permanentImpact: 0.0003, volatility: 0.02 },
  'ETH-USDT': { temporaryImpact: 0.00015, permanentImpact: 0.0004, volatility: 0.025 },
  'SOL-USDT': { temporaryImpact: 0.0002, permanentImpact: 0.0005, volatility: 0.035 },
  'BNB-USDT': { temporaryImpact: 0.00018, permanentImpact: 0.00045, volatility: 0.03 },
  'XRP-USDT': { temporaryImpact: 0.00025, permanentImpact: 0.0006, volatility: 0.04 },
  'ADA-USDT': { temporaryImpact: 0.00025, permanentImpact: 0.0006, volatility: 0.04 },
  'DOGE-USDT': { temporaryImpact: 0.0003, permanentImpact: 0.0007, volatility: 0.045 },
  'AVAX-USDT': { temporaryImpact: 0.00022, permanentImpact: 0.00055, volatility: 0.038 },
};

/**
 * Calculate the execution price for a market order
 * @param orderBook The L2 order book data
 * @param quantity The order quantity in USD
 * @returns The execution price and slippage
 */
const calculateExecutionPrice = (orderBook: OrderBookData, quantity: number) => {
  let remainingQuantity = quantity;
  let totalCost = 0;
  let volumeWeightedPrice = 0;
  
  // For a buy order, we go through asks
  for (const [priceStr, sizeStr] of orderBook.asks) {
    const price = parseFloat(priceStr);
    const size = parseFloat(sizeStr);
    const levelValue = price * size;
    
    if (remainingQuantity <= 0) break;
    
    const quantityTaken = Math.min(remainingQuantity, levelValue);
    totalCost += quantityTaken;
    volumeWeightedPrice += price * (quantityTaken / quantity);
    remainingQuantity -= quantityTaken;
  }
  
  // Calculate the mid price for slippage comparison
  const bestBid = parseFloat(orderBook.bids[0][0]);
  const bestAsk = parseFloat(orderBook.asks[0][0]);
  const midPrice = (bestBid + bestAsk) / 2;
  
  // Calculate slippage as the difference between execution price and mid price
  const slippage = volumeWeightedPrice - midPrice;
  const slippagePercent = slippage / midPrice;
  
  return { 
    executionPrice: volumeWeightedPrice, 
    slippage,
    slippagePercent
  };
};

/**
 * Calculate the fees based on the fee tier
 * @param params The simulation parameters
 * @param executionPrice The execution price
 * @returns The estimated fees
 */
const calculateFees = (params: SimulationParams, executionPrice: number) => {
  // Get the fee rates for the selected tier
  const feeRates = FEE_TIERS[params.feeTier as keyof typeof FEE_TIERS] || FEE_TIERS.VIP0;
  
  // For market orders, mostly taker fees apply
  // We estimate a 90% taker / 10% maker split for market orders
  const takerProportion = 0.9;
  const makerProportion = 0.1;
  
  const takerFee = params.quantity * feeRates.taker * takerProportion;
  const makerFee = params.quantity * feeRates.maker * makerProportion;
  
  const totalFee = takerFee + makerFee;
  const feePercent = totalFee / params.quantity;
  
  return { 
    fees: totalFee, 
    feesPercent: feePercent,
    makerProportion
  };
};

/**
 * Calculate market impact using the Almgren-Chriss model
 * @param params The simulation parameters
 * @param orderBook The order book data
 * @returns The estimated market impact
 */
const calculateMarketImpact = (params: SimulationParams, orderBook: OrderBookData) => {
  // Get the constants for the selected asset
  const assetKey = params.asset as keyof typeof MARKET_IMPACT_CONSTANTS;
  const constants = MARKET_IMPACT_CONSTANTS[assetKey] || MARKET_IMPACT_CONSTANTS['BTC-USDT'];
  
  // Calculate the average daily volume (this would be more accurate with historical data)
  // For simplicity, we'll estimate it based on the order book depth
  const estimatedADV = orderBook.asks.reduce((sum, level) => {
    return sum + parseFloat(level[0]) * parseFloat(level[1]);
  }, 0) * 100; // Multiply by 100 as a rough estimate of daily volume
  
  // Calculate the share of volume the order represents
  const shareOfVolume = params.quantity / estimatedADV;
  
  // Calculate market impact using Almgren-Chriss model
  // Impact = σ * |X| * (1 + sign(X) * γ) * (|X| / V)^δ
  // Where σ is market volatility, X is order size, γ is permanent impact factor,
  // V is estimated volume, and δ is a scaling parameter (usually 0.5)
  
  const volatility = constants.volatility;
  const temporaryImpact = constants.temporaryImpact;
  const permanentImpact = constants.permanentImpact;
  
  const impact = volatility * params.quantity * 
                 (1 + permanentImpact) * 
                 Math.pow(shareOfVolume, 0.5) * 
                 temporaryImpact;
  
  const midPrice = (parseFloat(orderBook.asks[0][0]) + parseFloat(orderBook.bids[0][0])) / 2;
  const impactAmount = params.quantity * impact;
  const impactPercent = impact;
  
  return {
    marketImpact: impactAmount,
    marketImpactPercent: impactPercent
  };
};

/**
 * Calculate the complete simulation result
 * @param orderBook The order book data
 * @param params The simulation parameters
 * @returns The simulation result
 */
export const calculateSimulationResult = (
  orderBook: OrderBookData, 
  params: SimulationParams
): SimulationResult => {
  const startTime = performance.now();
  
  // Calculate execution price and slippage
  const { slippage, slippagePercent } = calculateExecutionPrice(orderBook, params.quantity);
  
  // Calculate fees
  const { fees, feesPercent, makerProportion } = calculateFees(params, params.quantity);
  
  // Calculate market impact
  const { marketImpact, marketImpactPercent } = calculateMarketImpact(params, orderBook);
  
  // Calculate net cost
  const netCost = slippage + fees + marketImpact;
  const netCostPercent = slippagePercent + feesPercent + marketImpactPercent;
  
  const endTime = performance.now();
  const processingTime = endTime - startTime;
  
  return {
    timestamp: Date.now(),
    quantity: params.quantity,
    expectedSlippage: slippage,
    expectedSlippagePercent: slippagePercent,
    expectedFees: fees,
    expectedFeesPercent: feesPercent,
    marketImpact: marketImpact,
    marketImpactPercent: marketImpactPercent,
    netCost: netCost,
    netCostPercent: netCostPercent,
    makerProportion: makerProportion,
    internalLatency: processingTime
  };
};
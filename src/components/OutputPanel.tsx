import React from 'react';
import { OrderBookData, SimulationResult } from '../types';
import { OrderBookVisualizer } from './OrderBookVisualizer';
import { Loader } from './Loader';
import { 
  AlertTriangleIcon, 
  ClockIcon, 
  TrendingDownIcon,
  CoinsIcon,
  BarChart4Icon,
  ArrowDownIcon,
  PercentIcon
} from 'lucide-react';

interface OutputPanelProps {
  result: SimulationResult | null;
  processingTime: number;
  isCalculating: boolean;
  isConnected: boolean;
  error: string | null;
  orderBookData: OrderBookData | null;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({ 
  result, 
  processingTime, 
  isCalculating,
  isConnected,
  error,
  orderBookData
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 4,
      maximumFractionDigits: 6
    }).format(value);
  };

  const formatTime = (ms: number) => {
    return `${ms.toFixed(2)} ms`;
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Simulation Results</h2>
        <div className="flex items-center">
          <ClockIcon className="h-4 w-4 mr-1 text-blue-400" />
          <span className="text-xs text-slate-300">
            Processing Time: {formatTime(processingTime)}
          </span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-md p-4 mb-6 animate-fadeIn">
          <div className="flex">
            <AlertTriangleIcon className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isCalculating && (
        <div className="flex justify-center my-8">
          <Loader />
        </div>
      )}

      {/* Not connected state */}
      {!isConnected && !error && (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="animate-pulse text-blue-400 mb-4">
            <AlertTriangleIcon className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">Connecting to WebSocket...</h3>
          <p className="text-sm text-slate-400 text-center max-w-md">
            Establishing connection to the OKX market data feed. This may take a few moments.
          </p>
        </div>
      )}

      {/* Results display */}
      {result && !isCalculating && (
        <div className="animate-fadeIn">
          {/* OrderBook Visualization */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-slate-300 mb-3">L2 Order Book</h3>
            {orderBookData && (
              <OrderBookVisualizer orderBookData={orderBookData} simulationAmount={result.quantity} />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Expected Slippage */}
            <div className="bg-slate-700 rounded-md p-4">
              <div className="flex items-center mb-2">
                <TrendingDownIcon className="h-4 w-4 text-blue-400 mr-2" />
                <h4 className="text-sm font-medium text-slate-300">Expected Slippage</h4>
              </div>
              <div className="flex justify-between items-baseline">
                <p className="text-2xl font-bold text-white">{formatCurrency(result.expectedSlippage)}</p>
                <p className="text-sm text-blue-400">{formatPercentage(result.expectedSlippagePercent)}</p>
              </div>
            </div>

            {/* Expected Fees */}
            <div className="bg-slate-700 rounded-md p-4">
              <div className="flex items-center mb-2">
                <CoinsIcon className="h-4 w-4 text-amber-400 mr-2" />
                <h4 className="text-sm font-medium text-slate-300">Expected Fees</h4>
              </div>
              <div className="flex justify-between items-baseline">
                <p className="text-2xl font-bold text-white">{formatCurrency(result.expectedFees)}</p>
                <p className="text-sm text-amber-400">{formatPercentage(result.expectedFeesPercent)}</p>
              </div>
            </div>

            {/* Market Impact */}
            <div className="bg-slate-700 rounded-md p-4">
              <div className="flex items-center mb-2">
                <BarChart4Icon className="h-4 w-4 text-green-400 mr-2" />
                <h4 className="text-sm font-medium text-slate-300">Market Impact</h4>
              </div>
              <div className="flex justify-between items-baseline">
                <p className="text-2xl font-bold text-white">{formatCurrency(result.marketImpact)}</p>
                <p className="text-sm text-green-400">{formatPercentage(result.marketImpactPercent)}</p>
              </div>
            </div>

            {/* Net Cost */}
            <div className="bg-slate-700 rounded-md p-4">
              <div className="flex items-center mb-2">
                <ArrowDownIcon className="h-4 w-4 text-red-400 mr-2" />
                <h4 className="text-sm font-medium text-slate-300">Net Cost</h4>
              </div>
              <div className="flex justify-between items-baseline">
                <p className="text-2xl font-bold text-white">{formatCurrency(result.netCost)}</p>
                <p className="text-sm text-red-400">{formatPercentage(result.netCostPercent)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Maker/Taker Proportion */}
            <div className="bg-slate-700 rounded-md p-4">
              <div className="flex items-center mb-2">
                <PercentIcon className="h-4 w-4 text-purple-400 mr-2" />
                <h4 className="text-sm font-medium text-slate-300">Maker/Taker Proportion</h4>
              </div>
              <div className="mt-2">
                <div className="w-full bg-slate-600 rounded-full h-2.5">
                  <div 
                    className="bg-purple-500 h-2.5 rounded-full" 
                    style={{ width: `${result.makerProportion * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-slate-400">Maker: {formatPercentage(result.makerProportion)}</span>
                  <span className="text-xs text-slate-400">Taker: {formatPercentage(1 - result.makerProportion)}</span>
                </div>
              </div>
            </div>

            {/* Internal Latency */}
            <div className="bg-slate-700 rounded-md p-4">
              <div className="flex items-center mb-2">
                <ClockIcon className="h-4 w-4 text-cyan-400 mr-2" />
                <h4 className="text-sm font-medium text-slate-300">Internal Latency</h4>
              </div>
              <p className="text-2xl font-bold text-white">{formatTime(result.internalLatency)}</p>
              <p className="text-xs text-slate-400 mt-1">Processing time per tick</p>
            </div>
          </div>

          {/* Timestamp */}
          <div className="mt-6 text-right">
            <p className="text-xs text-slate-500">
              Last updated: {new Date(result.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
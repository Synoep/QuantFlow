import React from 'react';
import { 
  WifiIcon, 
  WifiOffIcon, 
  InfoIcon,
  DollarSignIcon,
  SettingsIcon,
  BarChart3Icon,
  PercentIcon
} from 'lucide-react';

interface InputPanelProps {
  params: {
    exchange: string;
    asset: string;
    orderType: string;
    quantity: number;
    feeTier: string;
  };
  onParamsChange: (params: Partial<typeof params>) => void;
  isConnected: boolean;
}

// Available assets for the OKX exchange
const AVAILABLE_ASSETS = [
  'BTC-USDT',
  'ETH-USDT',
  'SOL-USDT',
  'BNB-USDT',
  'XRP-USDT',
  'ADA-USDT',
  'DOGE-USDT',
  'AVAX-USDT',
];

// Fee tiers based on OKX documentation
const FEE_TIERS = [
  { id: 'VIP0', maker: 0.0008, taker: 0.001 },
  { id: 'VIP1', maker: 0.0007, taker: 0.0009 },
  { id: 'VIP2', maker: 0.0006, taker: 0.0008 },
  { id: 'VIP3', maker: 0.0005, taker: 0.0007 },
  { id: 'VIP4', maker: 0.0004, taker: 0.0006 },
  { id: 'VIP5', maker: 0.0002, taker: 0.0004 },
];

export const InputPanel: React.FC<InputPanelProps> = ({ 
  params, 
  onParamsChange,
  isConnected 
}) => {
  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Input Parameters</h2>
        <div className="flex items-center">
          {isConnected ? (
            <div className="flex items-center text-green-400">
              <WifiIcon className="h-4 w-4 mr-1" />
              <span className="text-xs">Connected</span>
            </div>
          ) : (
            <div className="flex items-center text-red-400">
              <WifiOffIcon className="h-4 w-4 mr-1" />
              <span className="text-xs">Disconnected</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-5">
        {/* Exchange Selection */}
        <div className="space-y-2">
          <label className="flex items-center text-slate-300 text-sm font-medium">
            <SettingsIcon className="h-4 w-4 mr-2 text-blue-400" />
            Exchange
          </label>
          <select 
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-not-allowed"
            value={params.exchange}
            disabled={true}
          >
            <option value="OKX">OKX</option>
          </select>
          <p className="text-xs text-slate-400">Only OKX is supported in this version</p>
        </div>
        
        {/* Asset Selection */}
        <div className="space-y-2">
          <label className="flex items-center text-slate-300 text-sm font-medium">
            <BarChart3Icon className="h-4 w-4 mr-2 text-blue-400" />
            Spot Asset
          </label>
          <select 
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={params.asset}
            onChange={(e) => onParamsChange({ asset: e.target.value })}
          >
            {AVAILABLE_ASSETS.map(asset => (
              <option key={asset} value={asset}>{asset}</option>
            ))}
          </select>
        </div>
        
        {/* Order Type */}
        <div className="space-y-2">
          <label className="flex items-center text-slate-300 text-sm font-medium">
            <InfoIcon className="h-4 w-4 mr-2 text-blue-400" />
            Order Type
          </label>
          <select 
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-not-allowed"
            value={params.orderType}
            disabled={true}
          >
            <option value="market">Market</option>
          </select>
          <p className="text-xs text-slate-400">Only market orders are supported in this version</p>
        </div>
        
        {/* Quantity */}
        <div className="space-y-2">
          <label className="flex items-center text-slate-300 text-sm font-medium">
            <DollarSignIcon className="h-4 w-4 mr-2 text-blue-400" />
            Quantity (USD)
          </label>
          <div className="relative">
            <input 
              type="number" 
              className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={params.quantity} 
              onChange={(e) => onParamsChange({ quantity: Number(e.target.value) })}
              min="1"
              max="10000"
              step="1"
            />
            <span className="absolute right-3 top-2 text-slate-400">USD</span>
          </div>
          <p className="text-xs text-slate-400">Recommended: ~100 USD equivalent</p>
        </div>
        
        {/* Fee Tier */}
        <div className="space-y-2">
          <label className="flex items-center text-slate-300 text-sm font-medium">
            <PercentIcon className="h-4 w-4 mr-2 text-blue-400" />
            Fee Tier
          </label>
          <select 
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={params.feeTier}
            onChange={(e) => onParamsChange({ feeTier: e.target.value })}
          >
            {FEE_TIERS.map(tier => (
              <option key={tier.id} value={tier.id}>
                {tier.id} (Maker: {tier.maker * 100}%, Taker: {tier.taker * 100}%)
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-slate-700">
        <div className="flex items-start">
          <InfoIcon className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400">
            This simulator uses real-time data from OKX and applies advanced market models to estimate
            transaction costs. Results update with each orderbook tick.
          </p>
        </div>
      </div>
    </div>
  );
};
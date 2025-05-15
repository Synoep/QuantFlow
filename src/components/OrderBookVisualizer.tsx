import React, { useMemo } from 'react';
import { OrderBookData } from '../types';

interface OrderBookVisualizerProps {
  orderBookData: OrderBookData;
  simulationAmount: number;
}

export const OrderBookVisualizer: React.FC<OrderBookVisualizerProps> = ({ 
  orderBookData, 
  simulationAmount 
}) => {
  // Find the max volume to normalize the visualization
  const maxVolume = useMemo(() => {
    const askVolumes = orderBookData.asks.map(ask => parseFloat(ask[1]));
    const bidVolumes = orderBookData.bids.map(bid => parseFloat(bid[1]));
    return Math.max(...askVolumes, ...bidVolumes);
  }, [orderBookData]);

  // Calculate which levels would be affected by the trade
  const affectedLevels = useMemo(() => {
    let remainingAmount = simulationAmount;
    const affectedAsks: number[] = [];
    
    // For buying (simulating market buy)
    for (let i = 0; i < orderBookData.asks.length; i++) {
      const price = parseFloat(orderBookData.asks[i][0]);
      const volume = parseFloat(orderBookData.asks[i][1]);
      const levelValue = price * volume;
      
      if (remainingAmount > 0) {
        affectedAsks.push(i);
        remainingAmount -= levelValue;
      } else {
        break;
      }
    }
    
    return { asks: affectedAsks };
  }, [orderBookData, simulationAmount]);

  // Get the mid price for the spread calculation
  const midPrice = useMemo(() => {
    if (orderBookData.asks.length > 0 && orderBookData.bids.length > 0) {
      const lowestAsk = parseFloat(orderBookData.asks[0][0]);
      const highestBid = parseFloat(orderBookData.bids[0][0]);
      return (lowestAsk + highestBid) / 2;
    }
    return 0;
  }, [orderBookData]);

  // Calculate spread
  const spread = useMemo(() => {
    if (orderBookData.asks.length > 0 && orderBookData.bids.length > 0) {
      const lowestAsk = parseFloat(orderBookData.asks[0][0]);
      const highestBid = parseFloat(orderBookData.bids[0][0]);
      return lowestAsk - highestBid;
    }
    return 0;
  }, [orderBookData]);

  // Calculate spread percentage
  const spreadPercentage = useMemo(() => {
    if (midPrice > 0) {
      return (spread / midPrice) * 100;
    }
    return 0;
  }, [spread, midPrice]);

  return (
    <div className="bg-slate-700 rounded-md p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs text-slate-400">Depth Chart</div>
        <div className="text-xs">
          <span className="text-slate-400">Spread: </span>
          <span className="text-white font-medium">{spread.toFixed(2)}</span>
          <span className="text-slate-400 ml-1">({spreadPercentage.toFixed(4)}%)</span>
        </div>
      </div>
      
      <div className="flex space-x-1 h-36">
        {/* Bids (buy orders) */}
        <div className="w-1/2 flex flex-col-reverse">
          {orderBookData.bids.slice(0, 10).map((bid, index) => {
            const price = parseFloat(bid[0]);
            const volume = parseFloat(bid[1]);
            const normalizedVolume = (volume / maxVolume) * 100;
            
            return (
              <div key={`bid-${index}`} className="flex items-center h-3 mb-0.5">
                <div 
                  className="bg-green-500/50 h-full rounded-sm" 
                  style={{ width: `${normalizedVolume}%` }}
                ></div>
                <div className="ml-1 flex justify-between w-full">
                  <span className="text-[10px] text-green-400">{price.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400">{volume.toFixed(4)}</span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Asks (sell orders) */}
        <div className="w-1/2 flex flex-col">
          {orderBookData.asks.slice(0, 10).map((ask, index) => {
            const price = parseFloat(ask[0]);
            const volume = parseFloat(ask[1]);
            const normalizedVolume = (volume / maxVolume) * 100;
            const isAffected = affectedLevels.asks.includes(index);
            
            return (
              <div key={`ask-${index}`} className="flex items-center h-3 mb-0.5">
                <div 
                  className={`h-full rounded-sm ${isAffected ? 'bg-red-700/70' : 'bg-red-500/50'}`}
                  style={{ width: `${normalizedVolume}%` }}
                ></div>
                <div className="ml-1 flex justify-between w-full">
                  <span className={`text-[10px] ${isAffected ? 'text-red-300 font-medium' : 'text-red-400'}`}>
                    {price.toFixed(1)}
                  </span>
                  <span className={`text-[10px] ${isAffected ? 'text-slate-300' : 'text-slate-400'}`}>
                    {volume.toFixed(4)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-3 text-center">
        <span className="text-xs text-slate-400">Mid Price: </span>
        <span className="text-sm text-white font-medium">{midPrice.toFixed(2)}</span>
      </div>
      
      <div className="mt-2 text-xs text-center text-slate-500">
        {affectedLevels.asks.length > 0 ? (
          <p>Simulation would affect {affectedLevels.asks.length} price levels (highlighted in darker red)</p>
        ) : (
          <p>Simulation amount too small to impact visible levels</p>
        )}
      </div>
    </div>
  );
};
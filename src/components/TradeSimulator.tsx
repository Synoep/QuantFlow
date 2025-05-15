import React, { useState, useEffect } from 'react';
import { InputPanel } from './InputPanel';
import { OutputPanel } from './OutputPanel';
import { useWebSocket } from '../hooks/useWebSocket';
import { OrderBookData, SimulationResult } from '../types';
import { calculateSimulationResult } from '../utils/simulationUtils';

export const TradeSimulator: React.FC = () => {
  const [simulationParams, setSimulationParams] = useState({
    exchange: 'OKX',
    asset: 'BTC-USDT',
    orderType: 'market',
    quantity: 100,
    feeTier: 'VIP0',
  });

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { data: orderBookData, isConnected, connectionError } = useWebSocket(
    'wss://ws.okx.com:8443/ws/v5/public',
    {
      subscribe: {
        channel: 'books5',
        instId: simulationParams.asset
      }
    }
  );

  useEffect(() => {
    if (orderBookData && isConnected) {
      const startTime = performance.now();
      setIsCalculating(true);
      
      try {
        const result = calculateSimulationResult(orderBookData, simulationParams);
        setSimulationResult(result);
        setError(null);
      } catch (err) {
        setError(`Error calculating simulation: ${err instanceof Error ? err.message : String(err)}`);
        setSimulationResult(null);
      } finally {
        const endTime = performance.now();
        setProcessingTime(endTime - startTime);
        setIsCalculating(false);
      }
    }
  }, [orderBookData, simulationParams]);

  useEffect(() => {
    if (connectionError) {
      setError(`WebSocket connection error: ${connectionError}`);
    } else {
      setError(null);
    }
  }, [connectionError]);

  const handleParamsChange = (newParams: Partial<typeof simulationParams>) => {
    setSimulationParams(prev => ({ ...prev, ...newParams }));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-fadeIn">
      <div className="lg:w-1/3">
        <InputPanel 
          params={simulationParams}
          onParamsChange={handleParamsChange}
          isConnected={isConnected}
        />
      </div>
      
      <div className="lg:w-2/3">
        <OutputPanel 
          result={simulationResult}
          processingTime={processingTime}
          isCalculating={isCalculating}
          isConnected={isConnected}
          error={error}
          orderBookData={orderBookData}
        />
      </div>
    </div>
  );
};
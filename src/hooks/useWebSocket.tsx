import { useState, useEffect, useRef } from 'react';
import { OrderBookData } from '../types';

interface WebSocketConfig {
  subscribe?: {
    channel: string;
    instId: string;
  };
}

const PING_INTERVAL = 15000; // 15 seconds
const RECONNECT_DELAY = 3000; // 3 seconds
const MAX_RECONNECT_ATTEMPTS = 10;

export const useWebSocket = (url: string, config?: WebSocketConfig) => {
  const [data, setData] = useState<OrderBookData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isUnmountedRef = useRef(false);

  const clearIntervals = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const setupPing = (ws: WebSocket) => {
    clearIntervals();
    pingIntervalRef.current = window.setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ op: 'ping' }));
      }
    }, PING_INTERVAL);
  };

  const subscribe = (ws: WebSocket) => {
    if (config?.subscribe && ws.readyState === WebSocket.OPEN) {
      const subscribeMsg = {
        op: 'subscribe',
        args: [{
          channel: config.subscribe.channel,
          instId: config.subscribe.instId
        }]
      };
      ws.send(JSON.stringify(subscribeMsg));
    }
  };

  const connect = () => {
    if (socketRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
        setupPing(ws);
        subscribe(ws);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Handle pong response
          if (message.event === 'pong') {
            return;
          }

          // Handle OKX order book data
          if (message.data && Array.isArray(message.data)) {
            const orderBookData: OrderBookData = {
              timestamp: new Date().toISOString(),
              exchange: 'OKX',
              symbol: config?.subscribe?.instId || '',
              asks: message.data[0].asks || [],
              bids: message.data[0].bids || []
            };
            
            if (!isUnmountedRef.current) {
              setData(orderBookData);
            }
          }
        } catch (error) {
          console.warn('Failed to parse message:', error);
        }
      };

      ws.onerror = () => {
        if (!isUnmountedRef.current) {
          setIsConnected(false);
        }
      };

      ws.onclose = () => {
        if (isUnmountedRef.current) {
          return;
        }

        setIsConnected(false);
        clearIntervals();

        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = window.setTimeout(() => {
            if (!isUnmountedRef.current) {
              connect();
            }
          }, RECONNECT_DELAY);
        } else {
          setConnectionError('Connection failed after multiple attempts. Please refresh the page.');
        }
      };
    } catch (error) {
      if (!isUnmountedRef.current) {
        setConnectionError('Failed to establish connection');
        setIsConnected(false);
      }
    }
  };

  useEffect(() => {
    isUnmountedRef.current = false;
    connect();

    return () => {
      isUnmountedRef.current = true;
      if (socketRef.current) {
        socketRef.current.close();
      }
      clearIntervals();
    };
  }, [url, config?.subscribe?.instId]);

  return { data, isConnected, connectionError };
};
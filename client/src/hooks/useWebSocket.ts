import { useEffect, useRef, useState, useCallback } from 'react';

interface SlotUpdate {
  type: 'slot_update' | 'initial_slots';
  doctor_id: string;
  appointment_date: string;
  available_slots: string[];
}

interface UseWebSocketOptions {
  doctorId: string;
  appointmentDate: string;
  onSlotUpdate?: (slots: string[]) => void;
}

export const useWebSocket = ({ doctorId, appointmentDate, onSlotUpdate }: UseWebSocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const connectionKeyRef = useRef<string>('');

  const getConnectionKey = useCallback((docId: string, date: string) => {
    return `${docId}_${date}`;
  }, []);

  const connect = useCallback(() => {
    if (!doctorId || !appointmentDate) return;

    const newConnectionKey = getConnectionKey(doctorId, appointmentDate);
    
    // If we're already connected to the same doctor/date, don't reconnect
    if (websocketRef.current && connectionKeyRef.current === newConnectionKey) {
      return;
    }

    // Disconnect existing connection if different doctor/date
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
      setIsConnected(false);
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace('http', 'ws') || 'ws://localhost:8000';
    const baseUrl = backendUrl;
    const wsUrl = `${baseUrl}/booking/ws/slots/${doctorId}/${appointmentDate}`;
    
    console.log('WebSocket connecting to:', wsUrl);
    
    try {
      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;
      connectionKeyRef.current = newConnectionKey;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        console.log('WebSocket connected for slots');
      };

      ws.onmessage = (event) => {
        try {
          const data: SlotUpdate = JSON.parse(event.data);
          
          if (data.type === 'initial_slots' || data.type === 'slot_update') {
            setAvailableSlots(data.available_slots);
            onSlotUpdate?.(data.available_slots);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        // Only update state if this is still our current connection
        if (websocketRef.current === ws) {
          setIsConnected(false);
          websocketRef.current = null;
          connectionKeyRef.current = '';
          console.log('WebSocket disconnected');
        }
      };

      ws.onerror = (event) => {
        // Only update state if this is still our current connection
        if (websocketRef.current === ws) {
          setError('WebSocket connection error');
          console.error('WebSocket error:', event);
          setIsConnected(false);
        }
      };

    } catch (err) {
      setError('Failed to create WebSocket connection');
      console.error('WebSocket connection error:', err);
    }
  }, [doctorId, appointmentDate, onSlotUpdate, getConnectionKey]);

  const disconnect = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
      connectionKeyRef.current = '';
      setIsConnected(false);
    }
  }, []);

  // Only connect when component mounts or when doctorId/appointmentDate actually changes
  useEffect(() => {
    const newConnectionKey = getConnectionKey(doctorId, appointmentDate);
    
    // Only connect if we don't have a connection or if the key has changed
    if (!websocketRef.current || connectionKeyRef.current !== newConnectionKey) {
      connect();
    }
    
    return () => {
      // Only disconnect on unmount, not on every effect run
      if (websocketRef.current) {
        disconnect();
      }
    };
  }, [doctorId, appointmentDate]); // Remove connect and disconnect from dependencies

  return {
    isConnected,
    availableSlots,
    error,
    connect,
    disconnect
  };
}; 
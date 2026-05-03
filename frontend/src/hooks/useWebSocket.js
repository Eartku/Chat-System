// useWebSocket.js
import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default function useWebSocket(conversationId, token, onMessage) {
  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const [connected, setConnected] = useState(false);

  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const subscribeConversation = (client, conversationIdToSubscribe) => {
    if (!conversationIdToSubscribe || !client) return;
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.unsubscribe();
      } catch (error) {
        console.warn('[WebSocket] unsubscribe failed', error);
      }
      subscriptionRef.current = null;
    }

    console.debug('[WebSocket] subscribing', { conversationId: conversationIdToSubscribe });
    subscriptionRef.current = client.subscribe(
      `/topic/conversations/${conversationIdToSubscribe}`,
      (message) => {
        console.debug('[WebSocket] message received', {
          conversationId: conversationIdToSubscribe,
          body: message.body,
        });
        if (message.body) {
          try {
            const payload = JSON.parse(message.body);
            onMessageRef.current(payload);
          } catch (error) {
            console.error('[WebSocket] parse error', error, { raw: message.body });
          }
        }
      }
    );
  };

  useEffect(() => {
    if (!token) {
      console.debug('[WebSocket] no token, skipping connect');
      return;
    }

    const client = new Client({
      webSocketFactory: () => {
        console.debug('[WebSocket] creating SockJS connection to /ws');
        return new SockJS('/ws');
      },
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (msg) => {
        console.debug('[WebSocket STOMP]', msg);
      },
      onConnect: () => {
        setConnected(true);
        console.debug('[WebSocket] connected');
        subscribeConversation(client, conversationId);
      },
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error', frame);
      },
      onWebSocketError: (error) => {
        console.error('[WebSocket] WebSocket error', error);
      },
      onDisconnect: () => {
        setConnected(false);
        console.debug('[WebSocket] disconnected');
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      console.debug('[WebSocket] cleanup');
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
      client.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  }, [token]);

  useEffect(() => {
    if (!conversationId) return;
    const client = clientRef.current;
    if (client && client.active) {
      subscribeConversation(client, conversationId);
    }
  }, [conversationId]);

  return connected;
}
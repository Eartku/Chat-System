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

    // Unsubscribe cũ
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.unsubscribe();
      } catch (error) {
        console.warn('[WebSocket] unsubscribe failed', error);
      }
      subscriptionRef.current = null;
    }

    // Chỉ subscribe khi client thực sự connected
    if (!client.connected) {
      console.debug('[WebSocket] client not connected yet, skip subscribe');
      return;
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

  // Effect 1: khởi tạo STOMP client khi có token
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
      debug: (msg) => console.debug('[WebSocket STOMP]', msg),
      onConnect: () => {
        console.debug('[WebSocket] connected');
        setConnected(true);
        // Subscribe ngay khi connect xong, dùng ref để lấy conversationId hiện tại
        subscribeConversation(client, conversationIdRef.current);
      },
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error', frame);
        setConnected(false);
      },
      onWebSocketError: (error) => {
        console.error('[WebSocket] WebSocket error', error);
        setConnected(false);
      },
      onDisconnect: () => {
        console.debug('[WebSocket] disconnected');
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      console.debug('[WebSocket] cleanup');
      if (subscriptionRef.current) {
        try { subscriptionRef.current.unsubscribe(); } catch (_) {}
        subscriptionRef.current = null;
      }
      client.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  }, [token]);

  // Ref để onConnect callback luôn thấy conversationId mới nhất
  const conversationIdRef = useRef(conversationId);
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  // Effect 2: re-subscribe khi conversationId thay đổi VÀ đã connected
  useEffect(() => {
    if (!conversationId || !connected) return;
    const client = clientRef.current;
    if (client && client.connected) {
      subscribeConversation(client, conversationId);
    }
  }, [conversationId, connected]);

  return connected;
}
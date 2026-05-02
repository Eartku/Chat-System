// useWebSocket.js
import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default function useWebSocket(conversationId, token, onMessage) {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);

  // ✅ Giữ ref luôn trỏ đến callback mới nhất — không trigger reconnect
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!conversationId || !token) {
      console.debug('[WebSocket] skipped activation', { conversationId, hasToken: !!token });
      return;
    }

    console.debug('[WebSocket] activating', { conversationId });
    const client = new Client({
      webSocketFactory: () => {
        console.debug('[WebSocket] creating SockJS connection to /ws');
        return new SockJS('/ws');
      },
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      debug: (msg) => {
        console.debug('[WebSocket STOMP]', msg);
      },
      onConnect: () => {
        setConnected(true);
        console.debug('[WebSocket] connected', { conversationId });

        const subscription = client.subscribe(`/topic/conversations/${conversationId}`, (message) => {
          console.debug('[WebSocket] message received', { conversationId, body: message.body });
          if (message.body) {
            try {
              const payload = JSON.parse(message.body);
              onMessageRef.current(payload);
            } catch (error) {
              console.error('[WebSocket] parse error', error, { raw: message.body });
            }
          }
        });

        clientRef.current = { client, subscription };
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

    return () => {
      console.debug('[WebSocket] cleanup', { conversationId });
      setConnected(false);
      clientRef.current?.subscription?.unsubscribe();
      client.deactivate();
    };

  // ✅ Chỉ reconnect khi conversation hoặc token thay đổi, KHÔNG phải onMessage
  }, [conversationId, token]);

  return connected;
}
"use client";

import { useEffect, useRef } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";

/**
 * Hook để kết nối WebSocket và nhận thông báo real-time
 *
 * Tự động connect khi có token, subscribe vào /topic/admin-notifications
 * Khi nhận tin nhắn -> Thêm vào notification store và hiển thị toast
 */
export function useWebSocket() {
  const clientRef = useRef<Client | null>(null);
  const { isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Chỉ connect khi đã authenticated
    if (!isAuthenticated) {
      return;
    }

    // Tạo WebSocket client với SockJS fallback
    const client = new Client({
      webSocketFactory: () => {
        // SockJS returns a WebSocket-like object that STOMP can use
        return new SockJS(`${env.apiUrl}/ws`) as unknown as WebSocket;
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        logger.log("WebSocket connected");

        // Subscribe vào topic admin-notifications
        client.subscribe("/topic/admin-notifications", (message: IMessage) => {
          try {
            const notification = JSON.parse(message.body);

            // Thêm vào notification store
            addNotification({
              type: notification.type || "INFO",
              title: notification.title || "Thông báo",
              message: notification.message || "",
              orderId: notification.orderId,
              orderNumber: notification.orderNumber,
              customerName: notification.customerName,
              totalAmount: notification.totalAmount,
              timestamp: notification.timestamp || new Date().toISOString(),
            });

            // Hiển thị toast
            toast.info(notification.message || notification.title, {
              duration: 5000,
            });

            // Phát âm thanh nhẹ (nếu browser hỗ trợ)
            try {
              const audio = new Audio(
                "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77+efTQ8MT6fj8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUqgc7y2Yk2CBhou+/nn00PDE+n4/C2YxwGOJHX8sx5LAUkd8fw3ZBACg=="
              );
              audio.volume = 0.3;
              audio.play().catch(() => {
                // Ignore audio play errors (user may have blocked autoplay)
              });
            } catch {
              // Ignore audio errors
            }
          } catch (error) {
            logger.error("Failed to parse notification:", error);
          }
        });

        // Subscribe vào topic data-updates để nhận realtime updates cho Brands, Categories, Users
        client.subscribe("/topic/data-updates", (message: IMessage) => {
          try {
            const update = JSON.parse(message.body);
            const { entityType, action, entityId } = update;

            logger.debug("Received data update:", {
              entityType,
              action,
              entityId,
            });

            // Invalidate queries dựa trên entity type
            switch (entityType) {
              case "BRAND":
                queryClient.invalidateQueries({
                  queryKey: ["admin", "brands"],
                });
                logger.debug("Invalidated brands queries");
                break;
              case "CATEGORY":
                queryClient.invalidateQueries({
                  queryKey: ["admin", "categories"],
                });
                logger.debug("Invalidated categories queries");
                break;
              case "USER":
                queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
                logger.debug("Invalidated users queries");
                break;
              default:
                logger.debug("Unknown entity type:", entityType);
            }
          } catch (error) {
            logger.error("Failed to parse data update:", error);
          }
        });
      },
      onDisconnect: () => {
        logger.log("WebSocket disconnected");
      },
      onStompError: (frame) => {
        logger.error("STOMP error:", frame);
      },
      onWebSocketError: (event) => {
        logger.error("WebSocket error:", event);
      },
    });

    // Activate client
    client.activate();
    clientRef.current = client;

    // Cleanup khi unmount hoặc disconnect
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [isAuthenticated, addNotification, queryClient]);
}

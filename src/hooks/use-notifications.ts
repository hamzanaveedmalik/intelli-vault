"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

/**
 * Hook to poll for notification count changes
 */
export function useNotifications() {
  const [notificationCount, setNotificationCount] = useState(0);
  const previousCountRef = useRef(0);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications/count", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          const newCount = data.count || 0;
          const previousCount = previousCountRef.current;
          
          // If count increased (and not on initial mount), show toast
          if (!isInitialMount.current && newCount > previousCount && previousCount >= 0) {
            const diff = newCount - previousCount;
            if (diff > 0) {
              toast.info("New Notifications", {
                description: `You have ${diff} new notification${diff > 1 ? "s" : ""}`,
                action: {
                  label: "View",
                  onClick: () => {
                    window.location.href = "/notifications";
                  },
                },
              });
            }
          }
          
          setNotificationCount(newCount);
          previousCountRef.current = newCount;
          isInitialMount.current = false;
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    // Initial fetch
    fetchNotifications();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return { notificationCount };
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  metadata: unknown;
  priority: number;
  expires_at: string | null;
  is_read?: boolean;
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      // If user is logged in, get read status
      if (userId) {
        const { data: readData } = await supabase
          .from("user_notifications")
          .select("notification_id, read_at")
          .eq("user_id", userId);

        const readMap = new Map(
          readData?.map((r) => [r.notification_id, r.read_at !== null])
        );

        const withReadStatus = (data || []).map((n) => ({
          ...n,
          is_read: readMap.get(n.id) || false,
        }));

        setNotifications(withReadStatus);
        setUnreadCount(withReadStatus.filter((n) => !n.is_read).length);
      } else {
        setNotifications(data || []);
        setUnreadCount(data?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!userId) return;

    try {
      await supabase.from("user_notifications").upsert({
        user_id: userId,
        notification_id: notificationId,
        read_at: new Date().toISOString(),
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      const unreadIds = notifications
        .filter((n) => !n.is_read)
        .map((n) => ({
          user_id: userId,
          notification_id: n.id,
          read_at: new Date().toISOString(),
        }));

      if (unreadIds.length > 0) {
        await supabase.from("user_notifications").upsert(unreadIds);
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [
            { ...newNotification, is_read: false },
            ...prev,
          ]);
          setUnreadCount((prev) => prev + 1);

          // Show toast for new notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}

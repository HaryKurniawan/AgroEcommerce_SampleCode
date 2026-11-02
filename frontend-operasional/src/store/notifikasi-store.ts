import { create } from "zustand";

import { ApiNotification } from "@/types";

interface NotifikasiState {
  notifications: ApiNotification[];
  unreadCount: number;
  isInitialized: boolean;
  setNotifications: (notifs: ApiNotification[], unread: number) => void;
  addNotification: (notif: ApiNotification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
}

export const useNotifStore = create<NotifikasiState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isInitialized: false,

  setNotifications: (notifs, unread) =>
    set({
      notifications: Array.isArray(notifs) ? notifs : [],
      unreadCount: unread || 0,
      isInitialized: true,
    }),

  addNotification: (notif) =>
    set((state) => ({
      notifications: [
        notif,
        ...(Array.isArray(state.notifications) ? state.notifications : []),
      ],
      unreadCount: (state.unreadCount || 0) + 1,
    })),

  markAsRead: (id) =>
    set((state) => {
      const safeNotifs = Array.isArray(state.notifications)
        ? state.notifications
        : [];
      const isUnread = safeNotifs.find((n) => n.id === id && !n.isRead);
      if (!isUnread) return state;

      return {
        notifications: safeNotifs.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        ),
        unreadCount: Math.max(0, (state.unreadCount || 0) - 1),
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: (Array.isArray(state.notifications)
        ? state.notifications
        : []
      ).map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  removeNotification: (id) =>
    set((state) => {
      const safeNotifs = Array.isArray(state.notifications)
        ? state.notifications
        : [];
      const isUnread = safeNotifs.find((n) => n.id === id && !n.isRead);
      return {
        notifications: safeNotifs.filter((n) => n.id !== id),
        unreadCount: isUnread
          ? Math.max(0, (state.unreadCount || 0) - 1)
          : state.unreadCount || 0,
      };
    }),
}));

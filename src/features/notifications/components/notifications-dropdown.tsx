"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Check } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Spinner } from "@/shared/components/ui/spinner";
import { getNotifications, markNotificationsAsRead } from "../actions";
import type { Notification } from "../types";

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Carregar notificações
  const loadNotifications = useCallback(async () => {
    const result = await getNotifications(10);

    if (result.success && result.data) {
      setNotifications(result.data.notifications);
      setUnreadCount(result.data.unreadCount);
    }
  }, []);

  // Carregar ao montar e quando abrir
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  // Marcar todas como lidas
  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      await markNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: new Date() })),
      );
      setUnreadCount(0);
    });
  };

  // Marcar uma como lida
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      startTransition(async () => {
        await markNotificationsAsRead([notification.id]);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id
              ? { ...n, read: true, readAt: new Date() }
              : n,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      });
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isPending}
              className="h-auto py-1 px-2 text-xs"
            >
              {isPending ? (
                <Spinner className="h-3 w-3" />
              ) : (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Marcar lidas
                </>
              )}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-muted-foreground p-4 text-center text-sm">
              Nenhuma notificação
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
                asChild={!!notification.link}
              >
                {notification.link ? (
                  <Link href={notification.link} className="w-full">
                    <NotificationContent notification={notification} />
                  </Link>
                ) : (
                  <div className="w-full">
                    <NotificationContent notification={notification} />
                  </div>
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationContent({ notification }: { notification: Notification }) {
  return (
    <>
      <div className="flex w-full items-start gap-2">
        <div
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
            notification.read ? "bg-transparent" : "bg-blue-500"
          }`}
        />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium block truncate">
            {notification.title}
          </span>
          <span className="text-muted-foreground text-xs block truncate">
            {notification.message}
          </span>
        </div>
      </div>
      <span className="text-muted-foreground ml-4 text-xs">
        {formatDistanceToNow(new Date(notification.createdAt), {
          addSuffix: true,
          locale: ptBR,
        })}
      </span>
    </>
  );
}

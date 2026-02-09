"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications with react-query
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(10),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  const notifications = data?.data?.notifications || [];
  const unreadCount = data?.data?.unreadCount || 0;

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => markNotificationsAsRead(),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark single notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationsAsRead([notificationId]),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Marcar todas como lidas
  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  // Marcar uma como lida
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
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
              disabled={markAllAsReadMutation.isPending}
              className="h-auto py-1 px-2 text-xs"
            >
              {markAllAsReadMutation.isPending ? (
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
          {isLoading ? (
            <div className="flex justify-center items-center p-4">
              <Spinner className="h-5 w-5" />
            </div>
          ) : notifications.length === 0 ? (
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
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium block truncate">
              {notification.title}
            </span>
            {notification.read ?? <Check className="h-3 w-3" />}
          </div>
          <p className="text-muted-foreground text-xs block truncate">
            {notification.message}
          </p>
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

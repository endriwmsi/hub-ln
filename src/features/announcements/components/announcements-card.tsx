"use client";

import { IconBell } from "@tabler/icons-react";
import { useState } from "react";
import type { Announcement } from "@/features/announcements";
import { useActiveAnnouncements } from "@/features/announcements";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Skeleton } from "@/shared/components/ui/skeleton";

export const AnnouncementsCard = () => {
  const { data: announcements, isLoading } = useActiveAnnouncements();
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  const handleAnnouncementClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setAnnouncementOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setAnnouncementOpen(open);
    if (!open) {
      setSelectedAnnouncement(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="h-80 w-96 rounded-lg border">
        <CardHeader>
          <CardTitle className="text-lg">
            <IconBell className="inline-block mr-2 h-5 w-5 text-blue-500" />
            Anúncios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-80 w-96 rounded-lg border overflow-y-scroll">
        <CardHeader>
          <CardTitle className="text-lg">
            <IconBell className="inline-block mr-2 h-5 w-5 text-blue-500" />
            Anúncios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {announcements && announcements.length > 0 ? (
            announcements.map((announcement) => (
              <Card
                key={announcement.id}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => handleAnnouncementClick(announcement)}
              >
                <CardHeader>
                  <CardTitle className="text-md">
                    {announcement.title}
                  </CardTitle>
                  <CardDescription className="text-sm truncate">
                    {announcement.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))
          ) : (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm text-muted-foreground">
                Nenhum anúncio disponível no momento.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={announcementOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          {selectedAnnouncement && (
            <DialogHeader>
              <DialogTitle>{selectedAnnouncement.title}</DialogTitle>
              <DialogDescription>
                {selectedAnnouncement.description}
              </DialogDescription>
            </DialogHeader>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

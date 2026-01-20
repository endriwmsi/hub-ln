"use client";

import type { User } from "@/core/db/schema";
import { Switch } from "@/shared/components/ui/switch";
import { cn } from "@/shared/lib/utils";
import { useToggleApproval } from "../hooks/use-toggle-approval";

type ApprovalCellProps = {
  user: User;
};

export function ApprovalCell({ user }: ApprovalCellProps) {
  const { mutate: toggleApproval, isPending } = useToggleApproval();

  const handleToggle = (checked: boolean) => {
    toggleApproval({ userId: user.id, approved: checked });
  };

  return (
    <div className="flex items-center justify-center">
      <Switch
        className={cn(user.approved ? "bg-green-400" : "bg-red-400")}
        checked={user.approved}
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
    </div>
  );
}

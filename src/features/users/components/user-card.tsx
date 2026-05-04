"use client";

import {
  Copy,
  ExternalLink,
  MoreVertical,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn, getUserInitials } from "@/shared/lib/utils";
import type { GetUsersResponse } from "../actions";
import { useToggleApproval } from "../hooks/use-toggle-approval";

type UserWithSubscription = NonNullable<
  GetUsersResponse["data"]
>["users"][number];

type UserCardProps = {
  user: UserWithSubscription;
  isSelected: boolean;
  onSelectChange: (checked: boolean) => void;
};

export function UserCard({ user, isSelected, onSelectChange }: UserCardProps) {
  const { mutate: toggleApproval, isPending } = useToggleApproval();

  // const subscription = user.subscription;
  // const isActive =
  //   subscription?.status === "active" || subscription?.status === "trial";

  // const role = user.role as string;

  // const statusLabels: Record<string, string> = {
  //   trial: "Teste",
  //   pending: "Pendente",
  //   active: "Ativo",
  //   past_due: "Atrasado",
  //   canceled: "Cancelado",
  //   expired: "Expirado",
  // };

  // const statusVariants: Record<
  //   string,
  //   "default" | "secondary" | "destructive" | "outline"
  // > = {
  //   trial: "outline",
  //   pending: "secondary",
  //   active: "default",
  //   past_due: "destructive",
  //   canceled: "secondary",
  //   expired: "destructive",
  // };

  // const planStatus = subscription?.status || "expired";

  return (
    <Card
      className={cn(
        "group relative flex flex-col items-center overflow-hidden rounded-xl border bg-card p-5 transition-all duration-200 hover:shadow-md",
        user.approved ? "border-emerald-500/40" : "border-red-500/40",
        isSelected && "border-primary/40 bg-primary/5 ring-1 ring-primary/20",
      )}
    >
      <CardHeader>
        <div className="absolute top-3 left-3 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(v) => onSelectChange(!!v)}
            aria-label={`Selecionar ${user.name}`}
          />
        </div>

        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <span className="sr-only">Abrir menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/gerenciar-usuarios/${user.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isPending}
                onClick={() =>
                  toggleApproval({
                    userId: user.id,
                    approved: !user.approved,
                  })
                }
              >
                {user.approved ? (
                  <>
                    <ShieldX className="mr-2 h-4 w-4" />
                    Desaprovar usuário
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Aprovar usuário
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.id)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center w-full min-w-0">
        <Avatar className="h-16 w-16 my-8 border border-primary/20">
          <AvatarImage
            src={user.image ?? undefined}
            alt={user.name ?? "Usuário"}
          />
          <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
            {getUserInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <h3 className="text-sm font-semibold text-center truncate w-full max-w-full">
          {user.name || "Sem nome"}
        </h3>
        <p className="text-xs text-muted-foreground text-center truncate w-full max-w-full mt-0.5">
          {user.email}
        </p>

        {/* <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
        <Badge variant={role === "admin" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
          {role === "admin" ? "Admin" : "Usuário"}
        </Badge>
        <Badge variant={isActive ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
          {isActive ? "Ativo" : "Inativo"}
        </Badge>
        <Badge variant={user.approved ? "default" : "destructive"} className="text-[10px] px-1.5 py-0">
          {user.approved ? (
            <><Check className="h-2.5 w-2.5 mr-0.5" /> Aprovado</>
          ) : (
            "Pendente"
          )}
        </Badge>
      </div> */}

        {/* <div className="flex items-center justify-between w-full mt-3 pt-3 border-t">
        <div className="text-[10px] text-muted-foreground">
          <Badge
            variant={statusVariants[planStatus] || "secondary"}
            className="text-[10px] px-1.5 py-0"
          >
            {statusLabels[planStatus] || planStatus}
          </Badge>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {formatDate(user.createdAt)}
        </span>
      </div> */}
      </CardContent>
    </Card>
  );
}

"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  ReferralLinkCard,
  ReferralStatsCard,
  ReferralTreeView,
  UserSelector,
} from "@/features/referrals/components";
import { useAllUsers, useReferralTree } from "@/features/referrals/hooks";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";

interface ReferralsContentProps {
  currentUserId: string;
  isAdmin: boolean;
}

export function ReferralsContent({
  currentUserId,
  isAdmin,
}: ReferralsContentProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(
    isAdmin ? undefined : currentUserId,
  );

  // Buscar árvore do usuário selecionado
  const {
    data: treeData,
    isLoading: treeLoading,
    error: treeError,
  } = useReferralTree(selectedUserId);

  // Buscar lista de usuários (apenas para admin)
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useAllUsers();

  if (treeLoading || (isAdmin && usersLoading)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (treeError || (isAdmin && usersError)) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erro ao carregar dados. Tente novamente mais tarde.
        </AlertDescription>
      </Alert>
    );
  }

  if (treeData?.error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{treeData.error}</AlertDescription>
      </Alert>
    );
  }

  if (!treeData?.data) {
    return (
      <Alert>
        <AlertDescription>Nenhum dado disponível.</AlertDescription>
      </Alert>
    );
  }

  const { tree, stats, referralCode, referralLink } = treeData.data;

  return (
    <div className="space-y-6">
      {/* Seletor de usuário (apenas para admin) */}
      {isAdmin && usersData?.data && (
        <UserSelector
          users={usersData.data}
          selectedUserId={selectedUserId}
          onSelectUser={setSelectedUserId}
        />
      )}

      {/* Link de indicação */}
      <ReferralLinkCard
        referralCode={referralCode}
        referralLink={referralLink}
      />

      {/* Estatísticas */}
      <ReferralStatsCard stats={stats} />

      {/* Árvore de indicações */}
      <ReferralTreeView tree={tree} />
    </div>
  );
}

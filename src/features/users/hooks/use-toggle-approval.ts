import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toggleUserApproval } from "../actions/toggle-user-approval";

type ToggleApprovalParams = {
  userId: string;
  approved: boolean;
};

export function useToggleApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, approved }: ToggleApprovalParams) =>
      toggleUserApproval(userId, approved),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        // Invalida a query de usuários para recarregar a lista
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      console.error("Erro ao atualizar aprovação:", error);
      toast.error("Erro ao atualizar aprovação do usuário");
    },
  });
}

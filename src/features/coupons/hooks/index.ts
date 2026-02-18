"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
  validateCoupon,
} from "../actions";
import type {
  CreateCouponInput,
  UpdateCouponInput,
  ValidateCouponInput,
} from "../schemas";

// Hook para listar cupons
export function useCoupons() {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const result = await getCoupons();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}

// Hook para criar cupom
export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCouponInput) => createCoupon(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Cupom criado com sucesso");
        queryClient.invalidateQueries({ queryKey: ["coupons"] });
      } else {
        toast.error(result.error || "Erro ao criar cupom");
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar cupom",
      );
    },
  });
}

// Hook para atualizar cupom
export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCouponInput) => updateCoupon(input),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Cupom atualizado com sucesso");
        queryClient.invalidateQueries({ queryKey: ["coupons"] });
      } else {
        toast.error(result.error || "Erro ao atualizar cupom");
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar cupom",
      );
    },
  });
}

// Hook para deletar cupom
export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (couponId: string) => deleteCoupon(couponId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Cupom deletado com sucesso");
        queryClient.invalidateQueries({ queryKey: ["coupons"] });
      } else {
        toast.error(result.error || "Erro ao deletar cupom");
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Erro ao deletar cupom",
      );
    },
  });
}

// Hook para validar cupom (usado na página de solicitação)
export function useValidateCoupon() {
  return useMutation({
    mutationFn: (input: ValidateCouponInput) => validateCoupon(input),
  });
}

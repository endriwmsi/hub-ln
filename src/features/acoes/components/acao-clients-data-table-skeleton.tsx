"use client";

import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

function SkeletonRow({ variant = 1 }: { variant?: 1 | 2 | 3 | 4 | 5 }) {
  const widths = {
    1: {
      nome: "w-32",
      doc: "w-28",
      user: "w-24",
      userEmail: "w-32",
      valor: "w-16",
    },
    2: {
      nome: "w-36",
      doc: "w-24",
      user: "w-28",
      userEmail: "w-36",
      valor: "w-14",
    },
    3: {
      nome: "w-28",
      doc: "w-32",
      user: "w-20",
      userEmail: "w-28",
      valor: "w-18",
    },
    4: {
      nome: "w-40",
      doc: "w-28",
      user: "w-32",
      userEmail: "w-40",
      valor: "w-16",
    },
    5: {
      nome: "w-32",
      doc: "w-28",
      user: "w-24",
      userEmail: "w-32",
      valor: "w-14",
    },
  };
  const w = widths[variant];

  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-4" />
      </TableCell>
      <TableCell>
        <Skeleton className={`h-4 ${w.nome}`} />
      </TableCell>
      <TableCell>
        <Skeleton className={`h-4 ${w.doc}`} />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className={`h-4 ${w.valor}`} />
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <Skeleton className={`h-4 ${w.user}`} />
          <Skeleton className={`h-3 ${w.userEmail}`} />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-8" />
      </TableCell>
    </TableRow>
  );
}

export function AcaoClientsDataTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Skeleton className="h-4 w-4" />
            </TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Valor Unit.</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Data Envio</TableHead>
            <TableHead className="w-12">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <SkeletonRow variant={1} />
          <SkeletonRow variant={2} />
          <SkeletonRow variant={3} />
          <SkeletonRow variant={4} />
          <SkeletonRow variant={5} />
        </TableBody>
      </Table>
    </div>
  );
}

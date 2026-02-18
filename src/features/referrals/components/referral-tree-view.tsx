"use client";

import {
  ChevronDown,
  ChevronRight,
  User,
  UserCheck,
  UserX,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { ReferralNode } from "../types";

interface ReferralTreeViewProps {
  tree: ReferralNode;
}

interface TreeNodeProps {
  node: ReferralNode;
  level?: number;
}

function TreeNode({ node, level = 0 }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Expandir primeiros 2 níveis por padrão
  const hasChildren = node.children.length > 0;

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent",
          level > 0 && "ml-6",
        )}
        style={{ marginLeft: level > 0 ? `${level * 24}px` : undefined }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-accent"
            aria-label={isExpanded ? "Recolher" : "Expandir"}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="h-6 w-6" />
        )}

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          {node.approved ? (
            <UserCheck className="h-4 w-4 text-green-500" />
          ) : (
            <UserX className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{node.name}</span>
            <Badge variant={node.approved ? "default" : "secondary"}>
              {node.approved ? "Aprovado" : "Pendente"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{node.email}</span>
            <span>•</span>
            <span className="font-mono">{node.referralCode}</span>
            {node.children.length > 0 && (
              <>
                <span>•</span>
                <span>{node.children.length} indicações</span>
              </>
            )}
          </div>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="space-y-2">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ReferralTreeView({ tree }: ReferralTreeViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Árvore de Indicações</CardTitle>
        <CardDescription>
          Visualize sua rede de parceiros e sub-indicações
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tree.children.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <User className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              Nenhuma indicação ainda
            </h3>
            <p className="text-sm text-muted-foreground">
              Compartilhe seu link de indicação para começar a construir sua
              rede
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <TreeNode node={tree} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

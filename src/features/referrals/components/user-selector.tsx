"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface User {
  id: string;
  name: string;
  email: string;
  referralCode: string;
}

interface UserSelectorProps {
  users: User[];
  selectedUserId: string | undefined;
  onSelectUser: (userId: string) => void;
}

export function UserSelector({
  users,
  selectedUserId,
  onSelectUser,
}: UserSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecionar Usuário</CardTitle>
        <CardDescription>
          Como admin, você pode visualizar a árvore de qualquer usuário
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="user-select">Usuário</Label>
          <Select value={selectedUserId} onValueChange={onSelectUser}>
            <SelectTrigger id="user-select">
              <SelectValue placeholder="Selecione um usuário..." />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <span>{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({user.email})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

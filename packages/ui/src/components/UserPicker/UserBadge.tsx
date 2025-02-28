"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { X } from "lucide-react";
import { User } from "./types";

export interface UserBadgeProps {
  user: User;
  onRemove?: () => void;
}

export function UserBadge({ user, onRemove }: UserBadgeProps) {
  return (
    <Badge key={user.id} variant="secondary" className="flex items-center gap-2">
      <Avatar className="h-4 w-4">
        <AvatarImage src={user.image} alt={user.name} />
        <AvatarFallback>{user.name[0]}</AvatarFallback>
      </Avatar>
      {user.name}
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 hover:bg-transparent"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Badge>
  );
}
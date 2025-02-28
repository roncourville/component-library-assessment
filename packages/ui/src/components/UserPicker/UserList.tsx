"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { User } from "./types";

export interface UserListProps {
  users: User[];
}

export function UserList({ users }: UserListProps) {
  if (!users.length) return null;
  
  const firstUser = users[0];
  const remainingUsers = users.slice(1);
  const remainingCount = remainingUsers.length;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={firstUser.image} alt={firstUser.name} />
          <AvatarFallback>{firstUser.name[0]}</AvatarFallback>
        </Avatar>
        <span className="text-sm">{firstUser.name}</span>
      </div>

      {remainingCount > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="h-8 rounded-full bg-muted px-2 text-sm font-medium">
              +{remainingCount}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="space-y-2">
              {remainingUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center gap-2 p-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{user.name}</span>
                </div>
              ))}
              {remainingCount > 5 && (
                <div className="text-xs text-muted-foreground px-2">And {remainingCount - 5} more...</div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
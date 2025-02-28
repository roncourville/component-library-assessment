"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@workspace/ui/components/command";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Check, Loader2, X } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { User, UserPickerState } from "./types";
import { useUserPicker } from "./useUserPicker";
import { UserList } from "./UserList";
import { UserBadge } from "./UserBadge";

export interface UserPickerProps {
  users?: User[];
  selected?: User[];
  onChange?: (users: User[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  isLoading?: boolean;
}

export function UserPicker({
  users = [],
  selected = [],
  onChange,
  multiple = false,
  disabled = false,
  isEditing = false,
  isLoading = false,
}: UserPickerProps) {
  const { open, setOpen, handleSelect, handleRemove } = useUserPicker({
    selected,
    onChange,
    multiple,
    disabled
  });

  if (isEditing) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <div className="flex flex-wrap gap-2">
          {selected.map((user) => (
            <UserBadge 
              key={user.id} 
              user={user} 
              onRemove={() => handleRemove(user.id)} 
            />
          ))}
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8" disabled={disabled || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Add User"
              )}
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search users..." />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup>
                {users.map((user) => {
                  const isSelected = selected.some((s) => s.id === user.id);
                  return (
                    <CommandItem key={user.id} onSelect={() => handleSelect(user)} className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                      {isSelected && <Check className="ml-auto h-4 w-4" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  return <UserList users={selected} />;
}
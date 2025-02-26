"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@workspace/ui/components/command"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { Check, X } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Loader2 } from "lucide-react"

export interface User {
  id: string
  name: string
  email: string
  image?: string
}

interface AssigneesProps {
  users?: User[]
  selected?: User[]
  onChange?: (users: User[]) => void
  multiple?: boolean
  disabled?: boolean
  isEditing?: boolean
  isLoading?: boolean
}

export function Assignees({
  users = [],
  selected = [],
  onChange,
  multiple = false,
  disabled = false,
  isEditing = false,
  isLoading = false,
}: AssigneesProps) {
  const [open, setOpen] = React.useState(false)
  const firstUser = selected[0]
  const remainingUsers = selected.slice(1)
  const remainingCount = remainingUsers.length

  const handleSelect = (user: User) => {
    if (!onChange || disabled) return

    if (multiple) {
      const isSelected = selected.some((s) => s.id === user.id)
      if (isSelected) {
        onChange(selected.filter((s) => s.id !== user.id))
      } else {
        onChange([...selected, user])
      }
    } else {
      onChange([user])
    }
    if (!multiple) setOpen(false)
  }

  const handleRemove = (userId: string) => {
    if (!onChange || disabled) return
    onChange(selected.filter((u) => u.id !== userId))
  }

  if (isEditing) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <div className="flex flex-wrap gap-2">
          {selected.map((user) => (
            <Badge key={user.id} variant="secondary" className="flex items-center gap-2">
              <Avatar className="h-4 w-4">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              {user.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemove(user.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
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
                  const isSelected = selected.some((s) => s.id === user.id)
                  return (
                    <CommandItem key={user.id} onSelect={() => handleSelect(user)} className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                      {isSelected && <Check className="ml-auto h-4 w-4" />}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }

  if (!firstUser) return null

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
  )
}


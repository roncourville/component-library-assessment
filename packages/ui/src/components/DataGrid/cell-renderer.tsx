import { Badge } from "@workspace/ui/components/badge"
import Link from "next/link"
import type { ColumnDefinition } from "./schema"
import { Assignees, type User } from "@workspace/ui/components/UserPicker/UserPicker"
import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"

interface CellRendererProps {
  column: ColumnDefinition
  value: any
  row: Record<string, any>
  allUsers?: User[]
  isEditing?: boolean
  onCellChange?: (rowId: string, key: string, value: any) => void
  plasmidOptions?: string[]
  isLoadingUsers?: boolean
}

export function CellRenderer({
  column,
  value,
  row,
  allUsers = [],
  isEditing = false,
  onCellChange,
  plasmidOptions = [],
}: CellRendererProps) {
  if (isEditing && column.config.type !== "link") {
    switch (column.config.type) {
      case "tag":
        return (
          <Select value={value} onValueChange={(newValue) => onCellChange?.(row.id, column.key, newValue)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select plasmid" />
            </SelectTrigger>
            <SelectContent>
              {plasmidOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => {
              const newValue = Number.parseFloat(e.target.value)
              if (!isNaN(newValue)) {
                onCellChange?.(row.id, column.key, newValue)
              }
            }}
            className="w-24"
          />
        )

      case "user":
        const users = Array.isArray(value) ? value : [value]
        return (
          <Assignees
            users={allUsers}
            selected={users}
            onChange={(newUsers) => onCellChange?.(row.id, column.key, newUsers)}
            multiple={column.config.multiple}
            isEditing={true}
          />
        )

      case "text":
        return <Input value={value} onChange={(e) => onCellChange?.(row.id, column.key, e.target.value)} />
    }
  }

  // View mode rendering
  switch (column.config.type) {
    case "link":
      return (
        <Link href={`${column.config.baseUrl}/${value}`} className="text-blue-600 hover:underline">
          {value}
        </Link>
      )

    case "tag":
      return (
        <Badge variant="secondary" className="font-mono">
          {value}
        </Badge>
      )

    case "number":
      return (
        <span className="font-mono">
          {value}
          {column.config.unit ? ` ${column.config.unit}` : ""}
        </span>
      )

    case "user":
      const users = Array.isArray(value) ? value : [value]
      return <Assignees users={allUsers} selected={users} multiple={column.config.multiple} disabled={true} />

    case "text":
    default:
      return <span>{value}</span>
  }
}


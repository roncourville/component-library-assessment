export type ColumnType =
  | { type: "link"; baseUrl: string }
  | { type: "tag" }
  | { type: "number"; unit?: string }
  | { type: "text" }
  | { type: "user"; multiple?: boolean }

export interface ColumnDefinition {
  key: string
  header: string
  width?: string
  fixedWidth?: string
  dbField?: string // Added field to map to Supabase column name
  config: ColumnType
}

export interface GridSchema {
  columns: ColumnDefinition[],
  uniqueKey: string
}
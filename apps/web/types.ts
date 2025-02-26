export interface ColumnDefinition {
  key: string
  header: string
  type: "link" | "tag" | "number" | "text" | "user"
  width?: string
}

export const columns: ColumnDefinition[] = [
  { key: "id", header: "ID", type: "link", width: "w-48" },
  { key: "plasmid", header: "Plasmid", type: "tag" },
  { key: "volume", header: "Volume (μl)", type: "number", width: "w-32" },
  { key: "length", header: "Length (bp)", type: "number", width: "w-32" },
  { key: "storageLocation", header: "Storage Location", type: "text" },
  { key: "editedBy", header: "Edited By", type: "user" },
]


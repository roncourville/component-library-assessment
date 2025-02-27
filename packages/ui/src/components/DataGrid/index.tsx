"use client"

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"

import { Checkbox } from "@workspace/ui/components/checkbox"
import { ArrowDown, ArrowUp, Pencil, Plus, Save, Trash2 } from "lucide-react"
import DataRow from './DataRow';
import { json } from 'stream/consumers';

import { Button } from "@workspace/ui/components/button"
//import type { User } from "./components/assignees"
import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { toast } from "@workspace/ui/hooks/use-toast"
//import type { Plasmid } from "./lib/supabase-utils"


interface DataGridProps {
  data: Record<string, any>[]
  allUsers?: User[]
  plasmidOptions?: string[]
  onAdd?: (newData: Plasmid) => Promise<void>
  onUpdate?: (rowId: string, data: Record<string, any>) => void
  onDelete?: (rowId: string) => void
  isLoadingUsers?: boolean
  isLoading?: boolean
  gridSchema: any
  onEdit?: any
}


type SortDirection = "asc" | "desc" | null
type SortConfig = {
  key: string
  direction: SortDirection
  priority: number
}


export default function DataGrid({
  data,
  isLoading,
  onEdit,
  onDelete,
  // searchTerm,
  gridSchema,
  allUsers,
  plasmidOptions,

  onAdd,
  onUpdate,
  isLoadingUsers = false,
}: DataGridProps) {
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set())
  const [editingRows, setEditingRows] = React.useState<Set<string>>(new Set())
  const [editingCell, setEditingCell] = React.useState<{ rowId: string; key: string } | null>(null)
  const [rowEdits, setRowEdits] = React.useState<Record<string, Record<string, any>>>({})
  const [sortConfigs, setSortConfigs] = React.useState<SortConfig[]>([
    { key: "id", direction: "asc", priority: 1 }, // Default sort is ASC on ID
  ])

  // Add search state and handlers
  const [searchTerm, setSearchTerm] = React.useState("")
  const [searchField, setSearchField] = React.useState("all")

  // Ref for tracking click outside
  const cellRef = React.useRef<HTMLDivElement>(null)

  // Initialize row edits with current data
  React.useEffect(() => {
    const initialEdits: Record<string, Record<string, any>> = {}
    data.forEach((row) => {
      initialEdits[row.id] = { ...row }
    })
    setRowEdits(initialEdits)
  }, [data])

  // Handle click outside for exiting edit mode
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cellRef.current && !cellRef.current.contains(event.target as Node) && editingCell) {
        saveCurrentEdit(editingCell.rowId, editingCell.key)
        setEditingCell(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [editingCell])

  const saveCurrentEdit = (rowId: string, key: string) => {
    if (!editingRows.has(rowId)) {
      const updatedData = rowEdits[rowId]
      const originalRow = data.find((row) => row.id === rowId)

      if (updatedData && originalRow) {
        // Check if the value has actually changed
        const hasChanged = JSON.stringify(updatedData[key]) !== JSON.stringify(originalRow[key])

        if (hasChanged) {
          onUpdate?.(rowId, updatedData)
          toast({
            title: "Row updated",
          })
        }
      }
    }
  }

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(data.map((row) => row.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  // Update the cell click handler to pass the column key
  const handleCellClick = (rowId: string, key: string) => {
    if (gridSchema.columns.find((col) => col.key === key)?.config.type !== "link") {
      setEditingCell({ rowId, key })
    }
  }

  const handleCellChange = (rowId: string, key: string, value: any) => {
    setRowEdits((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [key]: value,
      },
    }))

    // For tag and user fields, save changes immediately
    const column = gridSchema.columns.find((col) => col.key === key)
    if (column?.config.type === "tag" || column?.config.type === "user") {
      const updatedData = {
        ...rowEdits[rowId],
        [key]: value,
      }

      const originalRow = data.find((row) => row.id === rowId)
      if (originalRow && JSON.stringify(updatedData[key]) !== JSON.stringify(originalRow[key])) {
        onUpdate?.(rowId, updatedData)
        toast({
          title: "Row updated",
        })
      }
    }
  }

  // Update the handleCellBlur function to skip tag and user fields
  const handleCellBlur = (rowId: string, columnKey: string) => {
    // Skip blur handling for tag and user fields
    const column = gridSchema.columns.find((col) => col.key === columnKey)
    if (column?.config.type === "tag" || column?.config.type === "user") {
      return
    }

    // Only save if we're editing a single cell (not a whole row)
    if (editingCell && editingCell.rowId === rowId && !editingRows.has(rowId)) {
      saveCurrentEdit(rowId, columnKey)
    }
  }

  const handleEditRow = (rowId: string) => {
    setEditingRows((prev) => new Set(prev).add(rowId))
    // Initialize row edits with current values
    const currentRow = data.find((row) => row.id === rowId)
    if (currentRow) {
      setRowEdits((prev) => ({
        ...prev,
        [rowId]: { ...currentRow },
      }))
    }
  }

  // Update the handleSaveRow function to show toast
  const handleSaveRow = (rowId: string) => {
    const updatedData = rowEdits[rowId]
    const originalRow = data.find((row) => row.id === rowId)

    if (updatedData && originalRow) {
      // Check if any values have changed
      let hasChanges = false

      for (const key in updatedData) {
        if (JSON.stringify(updatedData[key]) !== JSON.stringify(originalRow[key])) {
          hasChanges = true
          break
        }
      }

      if (hasChanges) {
        onUpdate?.(rowId, updatedData)
        toast({
          title: "Row updated",
        })
      }
    }

    setEditingRows((prev) => {
      const next = new Set(prev)
      next.delete(rowId)
      return next
    })

    setEditingCell(null)
  }

  const isEditing = (rowId: string, key: string) => {
    return editingRows.has(rowId) || (editingCell?.rowId === rowId && editingCell?.key === key)
  }

  // Handle delete for selected rows
  const handleDeleteSelected = () => {
    // Delete all selected rows
    selectedRows.forEach((id) => {
      onDelete?.(id)
    })

    // Show toast with appropriate message
    toast({
      title: selectedRows.size > 1 ? "Rows deleted" : "Row deleted",
    })

    setSelectedRows(new Set())
  }

  // Handle column sort
  const handleSort = (key: string) => {
    setSortConfigs((prevConfigs) => {
      // Find if this column is already being sorted
      const existingConfigIndex = prevConfigs.findIndex((config) => config.key === key)

      if (existingConfigIndex !== -1) {
        // Column is already being sorted, toggle direction or remove
        const existingConfig = prevConfigs[existingConfigIndex]
        const newConfigs = [...prevConfigs]

        if (existingConfig?.direction === "asc") {
          // Change to desc
          newConfigs[existingConfigIndex] = { ...existingConfig, direction: "desc" }
        } else if (existingConfig?.direction === "desc") {
          // Remove sort
          newConfigs.splice(existingConfigIndex, 1)
          // Update priorities
          return newConfigs.map((config, index) => ({
            ...config,
            priority: index + 1,
          }))
        }

        return newConfigs
      } else {
        // Add new sort with highest priority
        return [...prevConfigs, { key, direction: "asc", priority: prevConfigs.length + 1 }]
      }
    })
  }

  // Get sort config for a column
  const getSortConfig = (key: string) => {
    return sortConfigs.find((config) => config.key === key)
  }

  // Sort the data based on sort configs
  const sortedData = React.useMemo(() => {
    if (sortConfigs.length === 0) return [...data]

    // Sort by priority
    const sortedConfigs = [...sortConfigs].sort((a, b) => a.priority - b.priority)

    return [...data].sort((a, b) => {
      // Apply each sort config in order of priority
      for (const config of sortedConfigs) {
        const { key, direction } = config

        if (!direction) continue

        let valueA = a[key]
        let valueB = b[key]

        // Handle special cases for different column types
        const column = gridSchema.columns.find((col) => col.key === key)

        if (column?.config.type === "user" && Array.isArray(valueA) && Array.isArray(valueB)) {
          // Sort by first user's name
          valueA = valueA.length > 0 ? valueA[0].name : ""
          valueB = valueB.length > 0 ? valueB[0].name : ""
        }

        // Compare values
        if (valueA < valueB) {
          return direction === "asc" ? -1 : 1
        }
        if (valueA > valueB) {
          return direction === "asc" ? 1 : -1
        }
      }

      return 0
    })
  }, [data, sortConfigs])

  // Add filtered data based on search
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return sortedData

    return sortedData.filter((row) => {
      if (searchField === "all") {
        // Search in all fields
        return Object.entries(row).some(([key, value]) => {
          // Skip id field and handle different types
          if (key === "id") return false

          if (key === "assignees" && Array.isArray(value)) {
            // For users, search in names
            return value.some((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
          }

          // For other fields, convert to string and search
          return String(value).toLowerCase().includes(searchTerm.toLowerCase())
        })
      } else {
        // Search in specific field
        const value = row[searchField]

        if (searchField === "assignees" && Array.isArray(value)) {
          // For users, search in names
          return value.some((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
        }

        // For other fields, convert to string and search
        return String(value).toLowerCase().includes(searchTerm.toLowerCase())
      }
    })
  }, [sortedData, searchTerm, searchField])

  return (
    <div className="space-y-4" ref={cellRef}>
      <div className="flex items-center justify-between">
        <div className="w-full max-w-[600px]">
          <div className="flex">
            <Select value={searchField} onValueChange={setSearchField}>
              <SelectTrigger className="w-[240px] rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0 border-gray-300">
                <SelectValue placeholder="Search in..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                {gridSchema.columns.map((column) => (
                  <SelectItem key={column.key} value={column.key}>
                    {column.header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder={
                searchField === "all"
                  ? "Search..."
                  : `Search ${gridSchema.columns.find((col) => col.key === searchField)?.header.toLowerCase() || ""}...`
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-l-none focus:ring-0 focus:ring-offset-0 border-gray-300"
            />
          </div>
        </div>

        <div className="flex gap-2">
          {selectedRows.size > 0 && (
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
              disabled={isLoading}
              className="bg-[#635bff] hover:bg-[#4f46e5] text-white"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedRows.size})
            </Button>
          )}
          <Button onClick={onAdd} disabled={isLoading} className="bg-[#635bff] hover:bg-[#4f46e5] text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Row
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm stripe-card">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.size === data.length}
                  onCheckedChange={toggleAll}
                  className="checkbox-stripe"
                />
              </TableHead>
              {gridSchema.columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={`cursor-pointer`}
                  style={{ width: column.fixedWidth }}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {getSortConfig(column.key)?.direction === "asc" && <ArrowUp className="h-4 w-4 text-[#635bff]" />}
                    {getSortConfig(column.key)?.direction === "desc" && (
                      <ArrowDown className="h-4 w-4 text-[#635bff]" />
                    )}
                    {getSortConfig(column.key) && (
                      <span className="text-xs text-gray-500 ml-1">{getSortConfig(column.key)?.priority}</span>
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row) => (

              gridSchema.columns.map((column) => (
                <DataRow
                  key={row[gridSchema.uniqueKey]}
                  row={row}
                  isLoading={isLoading}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  columns={gridSchema.columns}
                  isChecked={selectedRows.has(row.id)}
                  toggleRow={setSelectedRows}
                  plasmidOptions={plasmidOptions}
                  allUsers={allUsers}
                  //isEditing={isEditing(row.id, column.key)}
                  isEditing={editingRows.has(row.id)}
                />
              ))
            ))}


            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={gridSchema.columns.length + 2} className="h-24 text-center text-gray-500">
                  {searchTerm ? "No results found." : "No data available."}
                </TableCell>
              </TableRow>
            )}

          </TableBody>
        </Table>
      </div>
    </div>
  )
}


//   const [sortConfigs, setSortConfigs] = React.useState<SortConfig[]>([
//     { key: "id", direction: "asc", priority: 1 }, // Default sort is ASC on ID
//   ])
//   const [searchTerm, setSearchTerm] = React.useState("")
//   const [searchField, setSearchField] = React.useState("all")
//   const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set())


//   const [editingRows, setEditingRows] = React.useState<Set<string>>(new Set())
//   const [editingCell, setEditingCell] = React.useState<{ rowId: string; key: string } | null>(null)
//   const [rowEdits, setRowEdits] = React.useState<Record<string, Record<string, any>>>({})

//   const toggleAll = (checked: boolean) => {
//     if (checked) {
//       setSelectedRows(new Set(data.map((row) => row.id)))
//     } else {
//       setSelectedRows(new Set())
//     }
//   }

//   const isEditing = (rowId: string, key: string) => {
//     return editingRows.has(rowId) || (editingCell?.rowId === rowId && editingCell?.key === key)
//   }

//   const handleEditRow = (rowId: string) => {
//     setEditingRows((prev) => new Set(prev).add(rowId))
//     // Initialize row edits with current values
//     const currentRow = data.find((row) => row.id === rowId)
//     if (currentRow) {
//       setRowEdits((prev) => ({
//         ...prev,
//         [rowId]: { ...currentRow },
//       }))
//     }
//   }

//   // Handle column sort
//   const handleSort = (key: string) => {
//     setSortConfigs((prevConfigs) => {
//       // Find if this column is already being sorted
//       const existingConfigIndex = prevConfigs.findIndex((config) => config.key === key)

//       if (existingConfigIndex !== -1) {
//         // Column is already being sorted, toggle direction or remove
//         const existingConfig = prevConfigs[existingConfigIndex]
//         const newConfigs = [...prevConfigs]

//         if (existingConfig?.direction === "asc") {
//           // Change to desc
//           newConfigs[existingConfigIndex] = { ...existingConfig, direction: "desc" }
//         } else if (existingConfig?.direction === "desc") {
//           // Remove sort
//           newConfigs.splice(existingConfigIndex, 1)
//           // Update priorities
//           return newConfigs.map((config, index) => ({
//             ...config,
//             priority: index + 1,
//           }))
//         }

//         return newConfigs
//       } else {
//         // Add new sort with highest priority
//         return [...prevConfigs, { key, direction: "asc", priority: prevConfigs.length + 1 }]
//       }
//     })
//   }

//   // Get sort config for a column
//   const getSortConfig = (key: string) => {
//     return sortConfigs.find((config) => config.key === key)
//   }

//   // Sort the data based on sort configs
//   const sortedData = React.useMemo(() => {
//     if (sortConfigs.length === 0) return [...data]

//     // Sort by priority
//     const sortedConfigs = [...sortConfigs].sort((a, b) => a.priority - b.priority)

//     return [...data].sort((a, b) => {
//       // Apply each sort config in order of priority
//       for (const config of sortedConfigs) {
//         const { key, direction } = config

//         if (!direction) continue

//         let valueA = a[key]
//         let valueB = b[key]

//         // Handle special cases for different column types
//         const column = gridSchema.columns.find((col) => col.key === key)

//         if (column?.config.type === "user" && Array.isArray(valueA) && Array.isArray(valueB)) {
//           // Sort by first user's name
//           valueA = valueA.length > 0 ? valueA[0].name : ""
//           valueB = valueB.length > 0 ? valueB[0].name : ""
//         }

//         // Compare values
//         if (valueA < valueB) {
//           return direction === "asc" ? -1 : 1
//         }
//         if (valueA > valueB) {
//           return direction === "asc" ? 1 : -1
//         }
//       }

//       return 0
//     })
//   }, [data, sortConfigs])


//   const filteredData = React.useMemo(() => {
//     if (!searchTerm) return sortedData

//     return sortedData.filter((row) => {
//       if (searchField === "all") {
//         // Search in all fields
//         return Object.entries(row).some(([key, value]) => {
//           // Skip id field and handle different types
//           if (key === "id") return false

//           if (key === "assignees" && Array.isArray(value)) {
//             // For users, search in names
//             return value.some((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
//           }

//           // For other fields, convert to string and search
//           return String(value).toLowerCase().includes(searchTerm.toLowerCase())
//         })
//       } else {
//         // Search in specific field
//         const value = row[searchField]

//         if (searchField === "assignees" && Array.isArray(value)) {
//           // For users, search in names
//           return value.some((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
//         }

//         // For other fields, convert to string and search
//         return String(value).toLowerCase().includes(searchTerm.toLowerCase())
//       }
//     })
//   }, [sortedData, searchTerm, searchField])

//   return (
// <div className="p-4">
//       <div className="overflow-x-auto">
//         <Table>
//         <TableHeader className="bg-gray-50">
//             <TableRow>
//               <TableHead className="w-12">
//                 <Checkbox
//                   checked={selectedRows.size === data.length}
//                   onCheckedChange={toggleAll}
//                   className="checkbox-stripe"
//                 />
//               </TableHead>
//               {gridSchema.columns.map((column) => (
//                 <TableHead
//                   key={column.key}
//                   className={`cursor-pointer`}
//                   style={{ width: column.fixedWidth }}
//                   onClick={() => handleSort(column.key)}
//                 >
//                   <div className="flex items-center gap-1">
//                     {column.header}
//                     {getSortConfig(column.key)?.direction === "asc" && <ArrowUp className="h-4 w-4 text-[#635bff]" />}
//                     {getSortConfig(column.key)?.direction === "desc" && (
//                       <ArrowDown className="h-4 w-4 text-[#635bff]" />
//                     )}
//                     {getSortConfig(column.key) && (
//                       <span className="text-xs text-gray-500 ml-1">{getSortConfig(column.key)?.priority}</span>
//                     )}
//                   </div>
//                 </TableHead>
//               ))}
//               <TableHead className="w-[100px]">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {filteredData.map((row) => (
//               <DataRow
//                 key={row[gridSchema.uniqueKey]}
//                 row={row}
//                 isLoading={isLoading}
//                 onEdit={onEdit}
//                 onDelete={onDelete}
//                 columns={gridSchema.columns}
//                 isChecked={selectedRows.has(row.id)}
//                 toggleRow={setSelectedRows}
//                 plasmidOptions={plasmidOptions}
//                 allUsers={allUsers}
//                 //isEditing={isEditing(row.id, column.key)}
//                 isEditing={editingRows.has(row.id)}
//               />
//             ))}
//             {filteredData.length === 0 && (
//               <TableRow>
//                 <TableCell colSpan={gridSchema.columns.length + 1} className="h-24 text-center text-gray-500">
//                   {searchTerm ? "No results found." : "No data available."}
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// };

// export default DataGrid;
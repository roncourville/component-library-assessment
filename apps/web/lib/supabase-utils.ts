import { supabase } from "./supabase"
import { gridSchema } from "../app/DataGridExample/schema"

// Helper function to map data from UI format to Supabase format
export function mapToSupabaseFormat(data: Record<string, any>): Record<string, any> {
  const supabaseData: Record<string, any> = {}

  gridSchema.columns.forEach((column) => {
    if (column.dbField && data[column.key] !== undefined) {
      // Special handling for assignees which needs to be stringified
      if (column.key === "assignees") {
        supabaseData[column.dbField] = JSON.stringify(data[column.key])
      } else {
        supabaseData[column.dbField] = data[column.key]
      }
    }
  })

  return supabaseData
}

// Helper function to map data from Supabase format to UI format
export function mapFromSupabaseFormat(data: Record<string, any>): Record<string, any> {
  const uiData: Record<string, any> = {}

  gridSchema.columns.forEach((column) => {
    if (column.dbField && data[column.dbField] !== undefined) {
      // Special handling for assignees which needs to be parsed
      if (column.key === "assignees") {
        uiData[column.key] =
          typeof data[column.dbField] === "string" ? JSON.parse(data[column.dbField]) : data[column.dbField] || []
      } else {
        uiData[column.key] = data[column.dbField]
      }
    }
  })

  return uiData
}

// CRUD operations
export async function fetchPlasmids() {
  const { data, error } = await supabase.from("plasmids").select("*")

  if (error) throw error

  return data.map(mapFromSupabaseFormat)
}

export async function addPlasmid(plasmid: Record<string, any>) {
  const supabaseData = mapToSupabaseFormat(plasmid)

  const { data, error } = await supabase.from("plasmids").insert([supabaseData]).select()

  if (error) throw error

  return data.map(mapFromSupabaseFormat)[0]
}

// Update the updatePlasmid function to check for changes
export async function updatePlasmid(id: string, plasmid: Record<string, any>) {
  // Get the current plasmid data
  const { data: currentData, error: fetchError } = await supabase.from("plasmids").select("*").eq("id", id).single()

  if (fetchError) throw fetchError

  // Map to UI format for comparison
  const currentUiData = mapFromSupabaseFormat(currentData)

  // Check if there are actual changes
  let hasChanges = false
  for (const key in plasmid) {
    if (JSON.stringify(plasmid[key]) !== JSON.stringify(currentUiData[key])) {
      hasChanges = true
      break
    }
  }

  // If no changes, return the current data
  if (!hasChanges) {
    return currentUiData
  }

  // Map to Supabase format and update
  const supabaseData = mapToSupabaseFormat(plasmid)

  const { data, error } = await supabase.from("plasmids").update(supabaseData).eq("id", id).select()

  if (error) throw error

  return data.map(mapFromSupabaseFormat)[0]
}

export async function deletePlasmid(id: string) {
  const { error } = await supabase.from("plasmids").delete().eq("id", id)

  if (error) throw error
}

export async function fetchUsers() {
  const { data, error } = await supabase.from("users").select("*")

  if (error) throw error

  return data
}

export async function searchPlasmids(searchTerm: string) {
  const { data, error } = await supabase.rpc("search_plasmids", { search_term: searchTerm })

  if (error) throw error

  return data.map(mapFromSupabaseFormat)
}


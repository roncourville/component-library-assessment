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
export async function fetchRows(options?: { 
  page?: number; 
  pageSize?: number; 
  searchTerm?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  prefetchAdjacentPages?: boolean;
}) {
  const { 
    page = 1, 
    pageSize = 10,
    searchTerm = '',
    sortColumn = 'id',
    sortDirection = 'asc',
    prefetchAdjacentPages = true
  } = options || {};

  // Calculate offset for pagination
  let fetchPageSize = pageSize;
  let offset = (page - 1) * pageSize;
  let startPage = page;
  
  // If prefetching adjacent pages, adjust the range to fetch
  if (prefetchAdjacentPages) {
    // Determine range to fetch based on current page (±2 pages, 5 pages total)
    // For page 1, fetch pages 1-5
    // For page 2, fetch pages 1-6
    // For page 3+, fetch pages (page-2) to (page+2)
    
    if (page <= 2) {
      // For pages 1-2, start from page 1 and fetch 5 pages forward
      fetchPageSize = pageSize * 5;
      offset = 0; // Start from the first page
      console.log(`For page ${page}, fetching pages 1-5`);
    } else {
      // For page 3+, fetch ±2 pages (5 pages total)
      fetchPageSize = pageSize * 5;
      offset = (page - 3) * pageSize; // Start 2 pages before current
      console.log(`For page ${page}, fetching pages ${page-2}-${page+2}`);
    }
  }
  
  console.log(`Fetching data with prefetch=${prefetchAdjacentPages}, range: offset=${offset}, limit=${fetchPageSize}`);
  
  // First, get the total count
  const countQuery = supabase.from("plasmids").select('id', { count: 'exact', head: true });
  
  // Build the data query with pagination
  let query = supabase.from("plasmids").select("*");
  
  // Add search if provided
  if (searchTerm) {
    // Use the search function if available, otherwise do basic filtering
    try {
      return searchPlasmids(searchTerm);
    } catch (e) {
      // If search RPC fails, fallback to basic filtering
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }
  }
  
  // Add sorting
  if (sortColumn && sortDirection) {
    console.log('Sorting by column:', sortColumn, 'direction:', sortDirection);
    
    // Find the corresponding db field for the column
    const column = gridSchema.columns.find(col => col.key === sortColumn);
    const dbFieldName = column?.dbField || sortColumn;
    
    console.log('Using DB field for sorting:', dbFieldName);
    query = query.order(dbFieldName, { ascending: sortDirection === 'asc' });
  }
  
  // Add pagination with the adjusted range if prefetching
  query = query.range(offset, offset + fetchPageSize - 1);
  
  try {
    // Execute both queries
    const [countResult, dataResult] = await Promise.all([
      countQuery,
      query
    ]);
    
    // Check for errors
    if (countResult.error) {
      console.error('Count query error:', countResult.error);
      throw countResult.error;
    }
    
    if (dataResult.error) {
      console.error('Data query error:', dataResult.error);
      throw dataResult.error;
    }
    
    const totalCount = countResult.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    console.log('fetchRows result:', {
      dataCount: dataResult.data.length,
      totalCount,
      page,
      pageSize,
      totalPages,
      offset,
      prefetchAdjacentPages
    });
    
    // Map all data to UI format
    const allFetchedData = dataResult.data.map(mapFromSupabaseFormat);
    
    // If we're prefetching, organize the data by page
    let paginatedData: Record<number, Record<string, any>[]> = {};
    
    if (prefetchAdjacentPages) {
      // Determine the first page in our fetched data
      let firstFetchedPage;
      if (page <= 2) {
        firstFetchedPage = 1; // We started from page 1
      } else {
        firstFetchedPage = page - 2; // We started 2 pages before the current page
      }
      
      // Organize data into pages (current page ±2 pages if available)
      for (let i = 0; i < 5; i++) {
        const pageNum = firstFetchedPage + i;
        // Skip if we're beyond total pages
        if (pageNum > totalPages) break;
        
        // Calculate the slice of data for this page
        const startIndex = i * pageSize;
        const endIndex = startIndex + pageSize;
        
        // Check if we have enough data for this page
        if (startIndex < allFetchedData.length) {
          paginatedData[pageNum] = allFetchedData.slice(startIndex, endIndex);
          console.log(`Cached page ${pageNum}: ${paginatedData[pageNum].length} items`);
        }
      }
      
      // Ensure we have data for the current page
      if (!paginatedData[page]) {
        paginatedData[page] = [];
      }
      
      console.log('Organized prefetched data by page:', 
        Object.keys(paginatedData).map(p => `Page ${p}: ${paginatedData[Number(p)].length} items`));
    }
  
    return {
      data: prefetchAdjacentPages ? paginatedData[page] : allFetchedData, // Current page data
      allPrefetchedData: prefetchAdjacentPages ? paginatedData : null, // All prefetched pages
      totalCount,
      page,
      pageSize,
      totalPages
    };
  } catch (error) {
    console.error('Error in fetchRows:', error);
    throw error;
  }
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


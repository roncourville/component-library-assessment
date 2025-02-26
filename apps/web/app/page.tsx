"use client"

import { useState, useEffect } from "react"
import DataGrid from "../data-grid"
import type { User } from "../components/assignees"
import { toast } from "@workspace/ui/hooks/use-toast"
import { Toaster } from "@workspace/ui/components/toaster"
import { fetchPlasmids, fetchUsers, addPlasmid, updatePlasmid, deletePlasmid } from "../lib/supabase-utils"
import "./globals.css"

const plasmidOptions = [
  "GT-plasmids-1: lentiCRISPR v2",
  "GT-plasmids-2: psPAX2",
  "GT-plasmids-3: pMD2.G",
  "GT-plasmids-4: CRISPRoff-v2.1",
  "GT-plasmids-5: pLKO.1",
  "GT-plasmids-6: pLJM1",
  "GT-plasmids-7: pX330",
  "GT-plasmids-8: pX458",
  "GT-plasmids-9: pLenti-CRISPR",
  "GT-plasmids-10: pAAV-CRISPR",
]

interface Plasmid {
  id: string
  plasmid: string
  volume: number
  length: number
  storageLocation: string
  assignees: User[]
}

export default function Page() {
  const [data, setData] = useState<Plasmid[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch plasmids from Supabase
  useEffect(() => {
    const loadPlasmids = async () => {
      setIsLoading(true)
      try {
        const plasmids = await fetchPlasmids() as Plasmid[]
        setData(plasmids)
      } catch (error) {
        console.error("Error fetching plasmids:", error)
        toast({
          title: "Error",
          description: "Failed to load plasmids",
          variant: "destructive",
        })
        setData([])
      } finally {
        setIsLoading(false)
      }
    }

    loadPlasmids()
  }, [])

  // Fetch users
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true)
      try {
        // Try to fetch from Supabase
        const supabaseUsers = await fetchUsers()

        if (supabaseUsers.length > 0) {
          setUsers(supabaseUsers)
        } else {
          // Fallback to random user API
          const response = await fetch("https://randomuser.me/api?results=20")
          const data = await response.json()
          const userData = data.results.map((user: any) => ({
            id: user.login.uuid,
            name: `${user.name.first} ${user.name.last}`,
            email: user.email,
            image: user.picture.thumbnail,
          }))
          setUsers(userData)
        }
      } catch (error) {
        console.error("Failed to fetch users:", error)
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        })

        // Fallback to random user API
        try {
          const response = await fetch("https://randomuser.me/api?results=20")
          const data = await response.json()
          const userData = data.results.map((user: any) => ({
            id: user.login.uuid,
            name: `${user.name.first} ${user.name.last}`,
            email: user.email,
            image: user.picture.thumbnail,
          }))
          setUsers(userData)
        } catch (fallbackError) {
          console.error("Failed to fetch fallback users:", fallbackError)
        }
      } finally {
        setIsLoadingUsers(false)
      }
    }

    loadUsers()
  }, [])

  const handleAdd = async () => {
    setIsLoading(true)
    try {
      const newId = `inv-GT-plasmid-${Date.now()}`
      const newPlasmid = {
        id: newId,
        plasmid: "",
        volume: 0,
        length: 0,
        storageLocation: "",
        assignees: [],
      }

      // Add to Supabase
      await addPlasmid(newPlasmid)

      // Update local state
      setData((currentData) => [...currentData, newPlasmid])

      toast({
        title: "Success",
        description: "New plasmid added",
      })
    } catch (error) {
      console.error("Error adding plasmid:", error)
      toast({
        title: "Error",
        description: "Failed to add plasmid",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (rowId: string, updatedData: Record<string, any>) => {
    setIsLoading(true)
    try {
      // Update in Supabase
      await updatePlasmid(rowId, updatedData)

      // Update local state
      setData((currentData) => currentData.map((row) => (row.id === rowId ? { ...row, ...updatedData } : row)))

      // Updated toast message
      toast({
        title: "Row updated",
      })
    } catch (error) {
      console.error("Error updating plasmid:", error)
      toast({
        title: "Error",
        description: "Failed to update plasmid",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (rowId: string) => {
    setIsLoading(true)
    try {
      // Delete from Supabase
      await deletePlasmid(rowId)

      // Update local state
      setData((currentData) => currentData.filter((row) => row.id !== rowId))

      toast({
        title: "Row deleted",
      })
    } catch (error) {
      console.error("Error deleting plasmid:", error)
      toast({
        title: "Error",
        description: "Failed to delete plasmid",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4">
      <DataGrid
        data={data}
        allUsers={users}
        plasmidOptions={plasmidOptions}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        isLoadingUsers={isLoadingUsers}
        isLoading={isLoading}
      />
      <Toaster />
    </div>
  )
}


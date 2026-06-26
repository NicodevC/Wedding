import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Guest } from '../types/database'

export function useGuests() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGuests = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .order('name')

    if (error) {
      setError(error.message)
    } else {
      setGuests((data as Guest[]) ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchGuests()
  }, [fetchGuests])

  const addGuest = async (
    name: string,
    tableNumber?: string
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.from('guests').insert({
      name: name.trim(),
      ready: false,
      photos: [],
      table_number: tableNumber?.trim() || null,
    } as Record<string, unknown>)
    if (!error) await fetchGuests()
    return { error: error?.message ?? null }
  }

  const deleteGuest = async (id: string): Promise<void> => {
    await supabase.from('guests').delete().eq('id', id)
    await fetchGuests()
  }

  const updateTableNumber = async (id: string, tableNumber: string): Promise<void> => {
    await supabase
      .from('guests')
      .update({ table_number: tableNumber.trim() || null } as Record<string, unknown>)
      .eq('id', id)
    await fetchGuests()
  }

  return { guests, loading, error, refetch: fetchGuests, addGuest, deleteGuest, updateTableNumber }
}

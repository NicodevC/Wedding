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
  ): Promise<{ error: string | null; pin?: string }> => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString()
    const { error } = await supabase.from('guests').insert({
      name: name.trim(),
      ready: false,
      photos: [],
      table_number: tableNumber?.trim() || null,
      pin,
    } as Record<string, unknown>)
    if (!error) await fetchGuests()
    return { error: error?.message ?? null, pin }
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

  const updatePin = async (id: string, pin: string): Promise<void> => {
    await supabase
      .from('guests')
      .update({ pin: pin.trim() || null } as Record<string, unknown>)
      .eq('id', id)
    await fetchGuests()
  }

  return { guests, loading, error, refetch: fetchGuests, addGuest, deleteGuest, updateTableNumber, updatePin }
}

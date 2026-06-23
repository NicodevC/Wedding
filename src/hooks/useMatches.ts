import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Guest, Match } from '../types/database'

export interface MatchWithGuest {
  match: Match
  otherGuest: Guest
}

export function useMatches(currentUser: string | null) {
  const [matches, setMatches] = useState<MatchWithGuest[]>([])
  const [loading, setLoading] = useState(true)
  const [newMatch, setNewMatch] = useState<Guest | null>(null)

  const fetchMatches = useCallback(async () => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    const { data: matchData } = await supabase
      .from('matches')
      .select('*')
      .or(`guest_a.eq.${currentUser},guest_b.eq.${currentUser}`)
      .order('created_at', { ascending: false })

    const rows = (matchData as Match[] | null) ?? []

    if (!rows.length) {
      setMatches([])
      setLoading(false)
      return
    }

    const otherNames = rows.map((m) =>
      m.guest_a === currentUser ? m.guest_b : m.guest_a
    )

    const { data: guestData } = await supabase
      .from('guests')
      .select('*')
      .in('name', otherNames)

    const guestMap = new Map(((guestData as Guest[] | null) ?? []).map((g) => [g.name, g]))

    const combined = rows
      .map((m) => {
        const otherName = m.guest_a === currentUser ? m.guest_b : m.guest_a
        const otherGuest = guestMap.get(otherName)
        if (!otherGuest) return null
        return { match: m, otherGuest }
      })
      .filter(Boolean) as MatchWithGuest[]

    setMatches(combined)
    setLoading(false)
  }, [currentUser])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  // Realtime: subscribe to new matches involving current user
  useEffect(() => {
    if (!currentUser) return

    const channel = supabase
      .channel(`matches-rt-${currentUser}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'matches' },
        async (payload) => {
          const match = payload.new as Match
          if (match.guest_a !== currentUser && match.guest_b !== currentUser) return

          const otherName = match.guest_a === currentUser ? match.guest_b : match.guest_a
          const { data: other } = await supabase
            .from('guests')
            .select('*')
            .eq('name', otherName)
            .single()

          if (other) {
            const guest = other as Guest
            setNewMatch(guest)
            setMatches((prev) => [{ match, otherGuest: guest }, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser])

  const clearNewMatch = () => setNewMatch(null)

  return { matches, loading, newMatch, clearNewMatch, refetch: fetchMatches }
}

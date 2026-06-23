import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Guest, Like } from '../types/database'

const PASSED_KEY = (user: string) => `sdm_passed_${user}`

function getPassedFromStorage(user: string): Set<string> {
  try {
    const raw = localStorage.getItem(PASSED_KEY(user))
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

function savePassedToStorage(user: string, passed: Set<string>): void {
  localStorage.setItem(PASSED_KEY(user), JSON.stringify([...passed]))
}

export function useLikes(currentUser: string | null) {
  const [likedNames, setLikedNames] = useState<Set<string>>(new Set())
  const [passedNames, setPassedNames] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    const passed = getPassedFromStorage(currentUser)
    setPassedNames(passed)

    supabase
      .from('likes')
      .select('to_name')
      .eq('from_name', currentUser)
      .then(({ data }) => {
        const rows = (data as Pick<Like, 'to_name'>[] | null) ?? []
        setLikedNames(new Set(rows.map((l) => l.to_name)))
        setLoading(false)
      })
  }, [currentUser])

  const likeGuest = async (target: Guest): Promise<{ isMatch: boolean }> => {
    if (!currentUser) return { isMatch: false }

    await supabase.from('likes').insert({
      from_name: currentUser,
      to_name: target.name,
    })

    setLikedNames((prev) => new Set([...prev, target.name]))

    // Check for reciprocal like
    const { data: reciprocal } = await supabase
      .from('likes')
      .select('id')
      .eq('from_name', target.name)
      .eq('to_name', currentUser)
      .maybeSingle()

    if (reciprocal) {
      const [a, b] = [currentUser, target.name].sort()
      await supabase.from('matches').insert({ guest_a: a, guest_b: b })
      return { isMatch: true }
    }

    return { isMatch: false }
  }

  const passGuest = (name: string) => {
    if (!currentUser) return
    setPassedNames((prev) => {
      const next = new Set([...prev, name])
      savePassedToStorage(currentUser, next)
      return next
    })
  }

  return { likedNames, passedNames, loading, likeGuest, passGuest }
}

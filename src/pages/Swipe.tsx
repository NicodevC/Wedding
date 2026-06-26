import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useLikes } from '../hooks/useLikes'
import { useMatches } from '../hooks/useMatches'
import GuestCard from '../components/GuestCard'
import MatchPopup from '../components/MatchPopup'
import Layout from '../components/Layout'
import type { Guest } from '../types/database'

export default function Swipe() {
  const navigate = useNavigate()
  const currentUser = localStorage.getItem('wedding_user')

  const [allCandidates, setAllCandidates] = useState<Guest[]>([])
  const [loadingCandidates, setLoadingCandidates] = useState(true)
  const [localMatchGuest, setLocalMatchGuest] = useState<Guest | null>(null)
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null)
  const [actionDisabled, setActionDisabled] = useState(false)

  const { likedNames, passedNames, loading: likesLoading, likeGuest, passGuest } = useLikes(currentUser)
  const { newMatch, clearNewMatch } = useMatches(currentUser)

  // Load current user's profile for the match popup
  useEffect(() => {
    if (!currentUser) return
    supabase
      .from('guests')
      .select('*')
      .eq('name', currentUser)
      .single()
      .then(({ data }) => {
        if (data) setCurrentGuest(data as Guest)
      })
  }, [currentUser])

  // Fetch all candidates once on mount — filtering is done reactively below
  useEffect(() => {
    if (!currentUser) return
    supabase
      .from('guests')
      .select('*')
      .eq('ready', true)
      .neq('name', currentUser)
      .order('name')
      .then(({ data }) => {
        setAllCandidates((data as Guest[] | null) ?? [])
        setLoadingCandidates(false)
      })
  }, [currentUser])

  // Derived: always computed from latest likedNames + passedNames — no stale index
  const remaining = allCandidates.filter(
    (g) => !likedNames.has(g.name) && !passedNames.has(g.name)
  )
  const current = remaining[0] ?? null
  const loading = loadingCandidates || likesLoading
  const exhausted = !loading && remaining.length === 0

  if (!currentUser) {
    navigate('/login')
    return null
  }

  const handleLike = async () => {
    if (!current || actionDisabled) return
    setActionDisabled(true)

    const { isMatch } = await likeGuest(current)
    if (isMatch) setLocalMatchGuest(current)

    setTimeout(() => setActionDisabled(false), 300)
  }

  const handlePass = () => {
    if (!current || actionDisabled) return
    setActionDisabled(true)
    passGuest(current.name)
    setTimeout(() => setActionDisabled(false), 300)
  }

  const activeMatchGuest = localMatchGuest ?? newMatch

  const handleCloseMatch = () => {
    if (localMatchGuest) setLocalMatchGuest(null)
    if (newMatch) clearNewMatch()
    navigate('/matches')
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
        {loading ? (
          <div className="text-center text-gray-400">
            <div className="text-5xl mb-4 animate-pulse">💘</div>
            <p>Buscando solteros...</p>
          </div>
        ) : exhausted ? (
          <div className="text-center py-12 flex flex-col items-center gap-4">
            <div className="text-6xl">🎉</div>
            <h2 className="text-2xl font-black text-gray-800">¡Ya viste a todos!</h2>
            <p className="text-gray-500 text-sm max-w-xs">
              No quedan más invitados disponibles. Revisa tus matches o vuelve más tarde.
            </p>
            <button
              onClick={() => navigate('/matches')}
              className="py-3 px-8 rounded-2xl bg-gradient-to-r from-rose-500 to-violet-600 text-white font-bold shadow-lg active:scale-95 transition-transform"
            >
              Ver mis matches 💞
            </button>
          </div>
        ) : current ? (
          <>
            <p className="text-xs text-gray-400 font-medium self-end">
              {remaining.length} pendiente{remaining.length !== 1 ? 's' : ''}
            </p>
            <GuestCard
              key={current.id}
              guest={current}
              onLike={handleLike}
              onPass={handlePass}
              disabled={actionDisabled}
            />
          </>
        ) : null}
      </div>

      {activeMatchGuest && (
        <MatchPopup
          matchedGuest={activeMatchGuest}
          currentGuest={currentGuest}
          onClose={handleCloseMatch}
        />
      )}
    </Layout>
  )
}

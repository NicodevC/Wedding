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

  const [candidates, setCandidates] = useState<Guest[]>([])
  const [index, setIndex] = useState(0)
  const [loadingCandidates, setLoadingCandidates] = useState(true)
  const [localMatchGuest, setLocalMatchGuest] = useState<Guest | null>(null)
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null)
  const [actionDisabled, setActionDisabled] = useState(false)

  const { likedNames, passedNames, loading: likesLoading, likeGuest, passGuest } = useLikes(currentUser)
  const { newMatch, clearNewMatch } = useMatches(currentUser)

  // Load current user's guest profile for the popup
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

  // Load candidates once likes/passed are loaded
  useEffect(() => {
    if (!currentUser || likesLoading) return

    const load = async () => {
      setLoadingCandidates(true)

      const { data } = await supabase
        .from('guests')
        .select('*')
        .eq('ready', true)
        .neq('name', currentUser)
        .order('name')

      const all = (data as Guest[] | null) ?? []
      const filtered = all.filter(
        (g) => !likedNames.has(g.name) && !passedNames.has(g.name)
      )
      setCandidates(filtered)
      setLoadingCandidates(false)
    }

    load()
  }, [currentUser, likesLoading]) // intentionally stable: only re-run on mount

  const current = candidates[index]
  const exhausted = !loadingCandidates && !likesLoading && index >= candidates.length

  if (!currentUser) {
    navigate('/login')
    return null
  }

  const handleLike = async () => {
    if (!current || actionDisabled) return
    setActionDisabled(true)

    const { isMatch } = await likeGuest(current)
    if (isMatch) {
      setLocalMatchGuest(current)
    }
    setIndex((i) => i + 1)
    setTimeout(() => setActionDisabled(false), 300)
  }

  const handlePass = () => {
    if (!current || actionDisabled) return
    setActionDisabled(true)
    passGuest(current.name)
    setIndex((i) => i + 1)
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
        {loadingCandidates || likesLoading ? (
          <div className="text-center text-gray-400">
            <div className="text-5xl mb-4 animate-pulse">💘</div>
            <p>Buscando solteros...</p>
          </div>
        ) : exhausted ? (
          <div className="text-center py-12 flex flex-col items-center gap-4">
            <div className="text-6xl">🎉</div>
            <h2 className="text-2xl font-black text-gray-800">¡Ya viste a todos!</h2>
            <p className="text-gray-500 text-sm max-w-xs">
              No quedan más invitados disponibles por ahora. Revisa tus matches o vuelve más tarde.
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
            {/* Counter */}
            <p className="text-xs text-gray-400 font-medium self-end">
              {index + 1} / {candidates.length}
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

      {/* Match popup — realtime or local */}
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

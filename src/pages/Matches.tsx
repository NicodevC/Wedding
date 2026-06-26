import { useNavigate } from 'react-router-dom'
import { useMatches } from '../hooks/useMatches'
import MatchPopup from '../components/MatchPopup'
import Layout from '../components/Layout'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Guest } from '../types/database'

export default function Matches() {
  const navigate = useNavigate()
  const currentUser = localStorage.getItem('wedding_user')
  const { matches, loading, newMatch, clearNewMatch } = useMatches(currentUser)
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null)

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

  if (!currentUser) {
    navigate('/login')
    return null
  }

  return (
    <Layout>
      <div className="py-4">
        <div className="mb-6 text-center">
          <div className="text-4xl mb-2">💞</div>
          <h1 className="text-2xl font-black text-gray-800">Tus Matches</h1>
          <p className="text-gray-500 text-sm mt-1">
            {matches.length === 0
              ? 'Aún sin matches — ¡a swipear!'
              : `${matches.length} match${matches.length > 1 ? 'es' : ''} 🎉`}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3 animate-pulse">💞</div>
            <p>Cargando...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="text-6xl">💨</div>
            <p className="text-gray-400 text-center">
              Todavía no tienes matches.
              <br />
              Ve al swipe y dale like a alguien 😉
            </p>
            <button
              onClick={() => navigate('/swipe')}
              className="py-3 px-8 rounded-2xl bg-gradient-to-r from-rose-500 to-violet-600 text-white font-bold shadow-lg active:scale-95 transition-transform"
            >
              Ir a Swipe 💘
            </button>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {matches.map(({ match, otherGuest }) => {
              const mainPhoto = otherGuest.photos?.length
                ? otherGuest.photos[0]
                : otherGuest.photo_url
              return (
                <li
                  key={match.id}
                  className="bg-white rounded-3xl shadow-sm border border-pink-100 p-4 flex items-center gap-4 animate-fade-in"
                >
                  {mainPhoto ? (
                    <img
                      src={mainPhoto}
                      alt={otherGuest.name}
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-rose-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-violet-100 flex items-center justify-center text-3xl flex-shrink-0 border-2 border-rose-200">
                      👤
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-lg leading-tight">
                      {otherGuest.name}
                    </p>
                    {otherGuest.table_number && (
                      <p className="text-violet-500 text-xs">
                        🍽️ Mesa {otherGuest.table_number}
                      </p>
                    )}
                    {otherGuest.how_they_know && (
                      <p className="text-gray-500 text-sm truncate">
                        📍 {otherGuest.how_they_know}
                      </p>
                    )}
                    {otherGuest.favorite_song && (
                      <p className="text-gray-400 text-xs truncate">
                        🌍 {otherGuest.favorite_song}
                      </p>
                    )}
                  </div>
                  <span className="text-2xl flex-shrink-0">💞</span>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {newMatch && (
        <MatchPopup
          matchedGuest={newMatch}
          currentGuest={currentGuest}
          onClose={clearNewMatch}
        />
      )}
    </Layout>
  )
}

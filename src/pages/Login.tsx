import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGuests } from '../hooks/useGuests'
import Layout from '../components/Layout'

export default function Login() {
  const navigate = useNavigate()
  const { guests, loading } = useGuests()
  const [search, setSearch] = useState('')

  const filtered = guests.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  const selectGuest = (name: string) => {
    localStorage.setItem('wedding_user', name)
    navigate('/setup')
  }

  return (
    <Layout showNav={false}>
      <div className="pt-4">
        <div className="mb-6 text-center">
          <div className="text-4xl mb-2">👋</div>
          <h1 className="text-2xl font-black text-gray-800">¿Quién eres?</h1>
          <p className="text-gray-500 text-sm mt-1">Selecciona tu nombre de la lista</p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Buscar mi nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-300 text-gray-700"
          />
        </div>

        {/* Guest list */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3 animate-pulse">💍</div>
            <p>Cargando invitados...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">🤔</div>
            <p>
              {search ? 'No encontré ese nombre' : 'No hay invitados aún'}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((guest) => (
              <li key={guest.id}>
                <button
                  onClick={() => selectGuest(guest.name)}
                  className="
                    w-full flex items-center gap-4 p-4 rounded-2xl
                    bg-white shadow-sm border border-gray-100
                    active:scale-[0.98] transition-transform
                    hover:border-rose-200 hover:shadow-md
                  "
                >
                  {guest.photo_url ? (
                    <img
                      src={guest.photo_url}
                      alt={guest.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-200 to-violet-200 flex items-center justify-center text-xl flex-shrink-0">
                      👤
                    </div>
                  )}
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-bold text-gray-800">{guest.name}</p>
                    {guest.ready && (
                      <p className="text-xs text-rose-500">Perfil completo ✓</p>
                    )}
                  </div>
                  <span className="text-gray-300 text-xl flex-shrink-0">›</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  )
}

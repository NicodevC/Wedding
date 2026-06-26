import { useState } from 'react'
import { useGuests } from '../hooks/useGuests'
import Layout from '../components/Layout'

const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS as string | undefined

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState(false)
  const [newGuestName, setNewGuestName] = useState('')
  const [newGuestTable, setNewGuestTable] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [addLoading, setAddLoading] = useState(false)
  const [editingTableId, setEditingTableId] = useState<string | null>(null)
  const [editingTableValue, setEditingTableValue] = useState('')

  const { guests, loading, addGuest, deleteGuest, updateTableNumber } = useGuests()

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (ADMIN_PASS && password === ADMIN_PASS) {
      setAuthenticated(true)
      setAuthError(false)
    } else {
      setAuthError(true)
    }
    setPassword('')
  }

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newGuestName.trim()
    if (!name) return

    setAddLoading(true)
    setAddError(null)

    const existing = guests.find((g) => g.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      setAddError('Ya existe un invitado con ese nombre.')
      setAddLoading(false)
      return
    }

    const { error } = await addGuest(name, newGuestTable)
    if (error) {
      setAddError('Error al añadir. ¿El nombre ya existe?')
    } else {
      setNewGuestName('')
      setNewGuestTable('')
    }
    setAddLoading(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar a ${name}? Esto borrará sus likes y matches.`)) return
    await deleteGuest(id)
  }

  const startEditTable = (id: string, current: string | null) => {
    setEditingTableId(id)
    setEditingTableValue(current ?? '')
  }

  const saveEditTable = async (id: string) => {
    await updateTableNumber(id, editingTableValue)
    setEditingTableId(null)
  }

  if (!authenticated) {
    return (
      <Layout showNav={false}>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="w-full max-w-xs">
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">🔐</div>
              <h1 className="text-2xl font-black text-gray-800">Panel Admin</h1>
              <p className="text-gray-400 text-sm mt-1">Acceso restringido</p>
            </div>

            <form onSubmit={handleAuth} className="flex flex-col gap-4">
              <input
                type="password"
                placeholder="Contraseña de admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`
                  w-full px-4 py-3 rounded-2xl border bg-white shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-rose-300
                  ${authError ? 'border-rose-400' : 'border-gray-200'}
                `}
                autoFocus
              />
              {authError && (
                <p className="text-rose-500 text-sm text-center">
                  Contraseña incorrecta 🙅
                </p>
              )}
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-violet-600 text-white font-bold shadow-lg active:scale-95 transition-transform"
              >
                Entrar
              </button>
            </form>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout showNav={false}>
      <div className="py-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-800">Panel Admin</h1>
            <p className="text-gray-400 text-sm">{guests.length} invitados registrados</p>
          </div>
          <span className="text-3xl">⚙️</span>
        </div>

        {/* Add guest */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 mb-6">
          <h2 className="font-bold text-gray-700 mb-3">Añadir invitado</h2>
          <form onSubmit={handleAddGuest} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nombre completo"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                maxLength={60}
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-300 text-gray-700 text-sm"
              />
              <input
                type="text"
                placeholder="Mesa"
                value={newGuestTable}
                onChange={(e) => setNewGuestTable(e.target.value)}
                maxLength={10}
                className="w-20 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-300 text-gray-700 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={addLoading || !newGuestName.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 text-white font-bold text-sm shadow active:scale-95 transition-transform disabled:opacity-50"
            >
              {addLoading ? '...' : '+ Añadir invitado'}
            </button>
          </form>
          {addError && (
            <p className="text-rose-500 text-xs mt-2">{addError}</p>
          )}
        </div>

        {/* Guest list */}
        {loading ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-3xl animate-pulse mb-2">⏳</div>
            Cargando...
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {guests.map((guest) => (
              <li
                key={guest.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex items-center gap-3"
              >
                {guest.photo_url ? (
                  <img
                    src={guest.photo_url}
                    alt={guest.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-100 to-violet-100 flex items-center justify-center flex-shrink-0 text-lg">
                    👤
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{guest.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className={`text-xs ${guest.ready ? 'text-emerald-500' : 'text-gray-400'}`}>
                      {guest.ready ? '✓ Listo' : '○ Sin perfil'}
                    </p>
                    {/* Inline table edit */}
                    {editingTableId === guest.id ? (
                      <input
                        autoFocus
                        type="text"
                        value={editingTableValue}
                        onChange={(e) => setEditingTableValue(e.target.value)}
                        onBlur={() => saveEditTable(guest.id)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEditTable(guest.id)}
                        placeholder="Mesa"
                        maxLength={10}
                        className="w-16 text-xs border border-rose-300 rounded-lg px-1.5 py-0.5 focus:outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => startEditTable(guest.id, guest.table_number)}
                        className="text-xs text-violet-500 border border-violet-200 rounded-lg px-1.5 py-0.5"
                      >
                        {guest.table_number ? `🍽️ Mesa ${guest.table_number}` : '+ Mesa'}
                      </button>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(guest.id, guest.name)}
                  className="text-rose-400 text-xl px-2 py-1 rounded-lg active:bg-rose-50 transition-colors flex-shrink-0"
                  aria-label={`Eliminar ${guest.name}`}
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  )
}

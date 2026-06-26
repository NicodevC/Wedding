import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useGuests } from '../hooks/useGuests'
import Layout from '../components/Layout'
import type { Guest } from '../types/database'

type Step = 'list' | 'pin'

export default function Login() {
  const navigate = useNavigate()
  const { guests, loading } = useGuests()
  const [search, setSearch] = useState('')
  const [step, setStep] = useState<Step>('list')
  const [selected, setSelected] = useState<Guest | null>(null)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const pinInputRef = useRef<HTMLInputElement>(null)

  const filtered = guests.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelectGuest = (guest: Guest) => {
    setSelected(guest)
    setPin('')
    setPinError(false)
    setStep('pin')
    setTimeout(() => pinInputRef.current?.focus(), 100)
  }

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected || pin.length !== 4) return

    setVerifying(true)
    setPinError(false)

    const { data } = await supabase
      .from('guests')
      .select('pin')
      .eq('name', selected.name)
      .single()

    const correct = (data as { pin: string | null } | null)?.pin

    if (correct && pin === correct) {
      localStorage.setItem('wedding_user', selected.name)
      navigate('/setup')
    } else {
      setPinError(true)
      setPin('')
      setTimeout(() => pinInputRef.current?.focus(), 50)
    }

    setVerifying(false)
  }

  // PIN step
  if (step === 'pin' && selected) {
    return (
      <Layout showNav={false}>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="w-full max-w-xs">
            <button
              onClick={() => setStep('list')}
              className="text-gray-400 text-sm mb-6 flex items-center gap-1"
            >
              ‹ Volver
            </button>

            <div className="text-center mb-8">
              {selected.photo_url ? (
                <img
                  src={selected.photo_url}
                  alt={selected.name}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-4 border-rose-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-violet-100 flex items-center justify-center text-4xl mx-auto mb-3">
                  👤
                </div>
              )}
              <h1 className="text-2xl font-black text-gray-800">Hola, {selected.name} 👋</h1>
              <p className="text-gray-400 text-sm mt-1">Introduce tu PIN de 4 dígitos</p>
            </div>

            <form onSubmit={handleVerifyPin} className="flex flex-col gap-4">
              <input
                ref={pinInputRef}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                  setPin(val)
                  setPinError(false)
                }}
                placeholder="• • • •"
                className={`
                  w-full text-center text-3xl font-black tracking-[1rem] py-4 rounded-2xl border bg-white shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-rose-300
                  ${pinError ? 'border-rose-400 bg-rose-50' : 'border-gray-200'}
                `}
              />
              {pinError && (
                <p className="text-rose-500 text-sm text-center">PIN incorrecto, intenta de nuevo 🙅</p>
              )}
              <button
                type="submit"
                disabled={pin.length !== 4 || verifying}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-violet-600 text-white font-bold text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50"
              >
                {verifying ? 'Verificando...' : 'Entrar 💘'}
              </button>
            </form>
          </div>
        </div>
      </Layout>
    )
  }

  // Name list step
  return (
    <Layout showNav={false}>
      <div className="pt-4">
        <div className="mb-6 text-center">
          <div className="text-4xl mb-2">👋</div>
          <h1 className="text-2xl font-black text-gray-800">¿Quién eres?</h1>
          <p className="text-gray-500 text-sm mt-1">Selecciona tu nombre de la lista</p>
        </div>

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

        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3 animate-pulse">💍</div>
            <p>Cargando invitados...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">🤔</div>
            <p>{search ? 'No encontré ese nombre' : 'No hay invitados aún'}</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((guest) => (
              <li key={guest.id}>
                <button
                  onClick={() => handleSelectGuest(guest)}
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

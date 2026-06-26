import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { resizeImage } from '../lib/imageResize'
import Layout from '../components/Layout'
import type { Guest } from '../types/database'

const MAX_PHOTOS = 3

export default function Setup() {
  const navigate = useNavigate()
  const currentUser = localStorage.getItem('wedding_user') ?? ''
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photos, setPhotos] = useState<string[]>([])
  const [howTheyKnow, setHowTheyKnow] = useState('')
  const [origin, setOrigin] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load existing profile
  useEffect(() => {
    supabase
      .from('guests')
      .select('*')
      .eq('name', currentUser)
      .single()
      .then(({ data }) => {
        if (data) {
          const g = data as Guest
          const existingPhotos = g.photos?.length
            ? g.photos
            : g.photo_url
            ? [g.photo_url]
            : []
          setPhotos(existingPhotos)
          setHowTheyKnow(g.how_they_know ?? '')
          setOrigin(g.favorite_song ?? '')
        }
      })
  }, [currentUser])

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset input so same file can be re-selected
    e.target.value = ''

    setUploading(true)
    setError(null)

    try {
      const resized = await resizeImage(file)
      const safeName = currentUser
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '_')
      const filename = `${safeName}_${Date.now()}.jpg`

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filename, resized, { contentType: 'image/jpeg', upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filename)

      const newPhotos = [...photos, publicUrl]
      setPhotos(newPhotos)

      // Persist immediately
      await supabase
        .from('guests')
        .update({
          photos: newPhotos,
          photo_url: newPhotos[0],
        } as Record<string, unknown>)
        .eq('name', currentUser)
    } catch (err) {
      console.error('Upload error:', err)
      const msg = err instanceof Error ? err.message : JSON.stringify(err)
      setError(`Error al subir foto: ${msg}`)
    } finally {
      setUploading(false)
    }
  }

  const handleRemovePhoto = async (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    setPhotos(newPhotos)
    await supabase
      .from('guests')
      .update({
        photos: newPhotos,
        photo_url: newPhotos[0] ?? null,
      } as Record<string, unknown>)
      .eq('name', currentUser)
  }

  const handleSave = async () => {
    if (!howTheyKnow.trim()) {
      setError('Cuéntanos cómo conoces a los novios 😊')
      return
    }

    setSaving(true)
    setError(null)

    const { error } = await supabase
      .from('guests')
      .update({
        photos,
        photo_url: photos[0] ?? null,
        how_they_know: howTheyKnow.trim(),
        favorite_song: origin.trim() || null,
        ready: true,
      } as Record<string, unknown>)
      .eq('name', currentUser)

    if (error) {
      setError('Error al guardar. Intenta de nuevo.')
    } else {
      navigate('/swipe')
    }

    setSaving(false)
  }

  return (
    <Layout showNav={false}>
      <div className="py-4">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-black text-gray-800">
            Hola, {currentUser} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Completa tu perfil para aparecer en el swipe
          </p>
        </div>

        {/* Photos */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Tus fotos ({photos.length}/{MAX_PHOTOS})
          </label>
          <div className="flex gap-3 flex-wrap">
            {photos.map((url, i) => (
              <div key={url} className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-sm">
                <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleRemovePhoto(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center leading-none"
                  aria-label="Eliminar foto"
                >
                  ✕
                </button>
                {i === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5">
                    Principal
                  </div>
                )}
              </div>
            ))}

            {photos.length < MAX_PHOTOS && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-24 h-24 rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform disabled:opacity-50"
              >
                {uploading ? (
                  <span className="text-xs text-gray-400">Subiendo...</span>
                ) : (
                  <>
                    <span className="text-3xl">📷</span>
                    <span className="text-xs text-rose-400 font-medium">Añadir</span>
                  </>
                )}
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAddPhoto}
          />
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              ¿Cómo conoces a los novios? *
            </label>
            <input
              type="text"
              value={howTheyKnow}
              onChange={(e) => setHowTheyKnow(e.target.value)}
              placeholder="Ej: Amiga de la uni de la novia"
              maxLength={80}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-300 text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              ¿De dónde eres? 🌍
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Ej: Madrid, Sevilla, México..."
              maxLength={80}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-300 text-gray-700"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="
            w-full mt-6 py-4 rounded-2xl
            bg-gradient-to-r from-rose-500 to-violet-600
            text-white font-bold text-lg shadow-lg
            active:scale-95 transition-transform
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {saving ? 'Guardando...' : '¡Listo! Empezar a hacer match 💘'}
        </button>

        <button
          onClick={() => navigate('/swipe')}
          className="w-full mt-3 py-3 text-gray-400 text-sm"
        >
          Completar después →
        </button>
      </div>
    </Layout>
  )
}

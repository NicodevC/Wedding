import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { resizeImage } from '../lib/imageResize'
import Layout from '../components/Layout'

export default function Setup() {
  const navigate = useNavigate()
  const currentUser = localStorage.getItem('wedding_user') ?? ''
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [howTheyKnow, setHowTheyKnow] = useState('')
  const [favoriteSong, setFavoriteSong] = useState('')
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
          const g = data as import('../types/database').Guest
          setPhotoUrl(g.photo_url)
          setPhotoPreview(g.photo_url)
          setHowTheyKnow(g.how_they_know ?? '')
          setFavoriteSong(g.favorite_song ?? '')
        }
      })
  }, [currentUser])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const resized = await resizeImage(file, 400)

      // Local preview
      const previewUrl = URL.createObjectURL(resized)
      setPhotoPreview(previewUrl)

      // Upload to Supabase Storage
      const filename = `${currentUser.replace(/\s+/g, '_')}_${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filename, resized, { contentType: 'image/jpeg', upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('photos').getPublicUrl(filename)

      setPhotoUrl(publicUrl)

      // Persist immediately so a reload doesn't lose the photo
      await supabase
        .from('guests')
        .update({ photo_url: publicUrl } as Record<string, unknown>)
        .eq('name', currentUser)
    } catch (err) {
      console.error('Upload error:', err)
      const msg = err instanceof Error ? err.message : JSON.stringify(err)
      setError(`Error al subir foto: ${msg}`)
      setPhotoPreview(null)
    } finally {
      setUploading(false)
    }
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
        photo_url: photoUrl,
        how_they_know: howTheyKnow.trim(),
        favorite_song: favoriteSong.trim() || null,
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

        {/* Photo upload */}
        <div className="flex flex-col items-center mb-6">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="relative w-32 h-32 rounded-full overflow-hidden shadow-lg active:scale-95 transition-transform"
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Tu foto"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-rose-100 to-violet-100 flex flex-col items-center justify-center gap-1">
                <span className="text-4xl">📷</span>
                <span className="text-xs text-gray-400">Subir foto</span>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-xs">Subiendo...</div>
              </div>
            )}
            {/* Edit overlay */}
            {photoPreview && !uploading && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                <span className="text-white text-sm font-bold">Cambiar</span>
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
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
              Tu canción favorita 🎵
            </label>
            <input
              type="text"
              value={favoriteSong}
              onChange={(e) => setFavoriteSong(e.target.value)}
              placeholder="Ej: Shape of You — Ed Sheeran"
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

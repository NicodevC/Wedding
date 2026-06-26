import { useState } from 'react'
import type { Guest } from '../types/database'

interface Props {
  guest: Guest
  onLike: () => void
  onPass: () => void
  disabled?: boolean
}

function PhotoLightbox({
  photos,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  photos: string[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-fade-in"
      style={{ width: '100dvw', height: '100dvh' }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 text-white text-3xl w-10 h-10 flex items-center justify-center rounded-full bg-black/40"
        onClick={onClose}
      >
        ✕
      </button>

      {/* Photo */}
      <img
        src={photos[index]}
        alt=""
        className="w-full h-full object-contain"
        style={{ maxHeight: '100dvh', maxWidth: '100dvw' }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Navigation */}
      {photos.length > 1 && (
        <>
          <button
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-3xl w-10 h-10 flex items-center justify-center rounded-full bg-black/40 disabled:opacity-30"
            disabled={index === 0}
            onClick={(e) => { e.stopPropagation(); onPrev() }}
          >
            ‹
          </button>
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-3xl w-10 h-10 flex items-center justify-center rounded-full bg-black/40 disabled:opacity-30"
            disabled={index === photos.length - 1}
            onClick={(e) => { e.stopPropagation(); onNext() }}
          >
            ›
          </button>
          <div className="flex gap-2 mt-4">
            {photos.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${i === index ? 'bg-white scale-125' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function GuestCard({ guest, onLike, onPass, disabled }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const allPhotos = guest.photos?.length ? guest.photos : (guest.photo_url ? [guest.photo_url] : [])
  const mainPhoto = allPhotos[0] ?? null

  const openLightbox = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!mainPhoto) return
    setLightboxIndex(0)
    setLightboxOpen(true)
  }

  return (
    <>
      <div className="relative w-full max-w-sm mx-auto animate-slide-up">
        {/* Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white" style={{ aspectRatio: '3/4' }}>
          {/* Photo — clickable to expand */}
          <div className="absolute inset-0 cursor-zoom-in" onClick={openLightbox}>
            {mainPhoto ? (
              <img
                src={mainPhoto}
                alt={guest.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-violet-100">
                <span className="text-8xl">👤</span>
              </div>
            )}
          </div>

          {/* Expand icon */}
          {mainPhoto && (
            <button
              onClick={openLightbox}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white text-sm"
              aria-label="Ampliar foto"
            >
              ⛶
            </button>
          )}

          {/* Photo count dots */}
          {allPhotos.length > 1 && (
            <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5">
              {allPhotos.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white pointer-events-none">
            <h2 className="text-2xl font-black leading-none mb-1">{guest.name}</h2>
            {guest.table_number && (
              <p className="text-white/90 text-sm mb-1">
                🍽️ Mesa {guest.table_number}
              </p>
            )}
            {guest.how_they_know && (
              <p className="text-white/80 text-sm mb-1">
                📍 {guest.how_they_know}
              </p>
            )}
            {guest.favorite_song && (
              <p className="text-white/70 text-sm">
                🌍 {guest.favorite_song}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-8 mt-5">
          <button
            onClick={onPass}
            disabled={disabled}
            aria-label="Pasar"
            className="
              w-16 h-16 rounded-full bg-white shadow-lg border border-gray-200
              flex items-center justify-center text-2xl
              active:scale-90 transition-transform
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            ✕
          </button>

          <button
            onClick={onLike}
            disabled={disabled}
            aria-label="Like"
            className="
              w-20 h-20 rounded-full shadow-lg
              bg-gradient-to-br from-rose-500 to-violet-600
              flex items-center justify-center text-3xl
              active:scale-90 transition-transform
              disabled:opacity-50 disabled:cursor-not-allowed
              -mt-2
            "
          >
            ❤️
          </button>

          <div className="w-16" />
        </div>
      </div>

      {lightboxOpen && allPhotos.length > 0 && (
        <PhotoLightbox
          photos={allPhotos}
          index={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setLightboxIndex((i) => Math.max(0, i - 1))}
          onNext={() => setLightboxIndex((i) => Math.min(allPhotos.length - 1, i + 1))}
        />
      )}
    </>
  )
}

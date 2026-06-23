import type { Guest } from '../types/database'

interface Props {
  guest: Guest
  onLike: () => void
  onPass: () => void
  disabled?: boolean
}

export default function GuestCard({ guest, onLike, onPass, disabled }: Props) {
  return (
    <div className="relative w-full max-w-sm mx-auto animate-slide-up">
      {/* Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white" style={{ aspectRatio: '3/4' }}>
        {/* Photo */}
        {guest.photo_url ? (
          <img
            src={guest.photo_url}
            alt={guest.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-100 to-violet-100">
            <span className="text-8xl">👤</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h2 className="text-2xl font-black leading-none mb-1">{guest.name}</h2>
          {guest.how_they_know && (
            <p className="text-white/80 text-sm mb-1">
              📍 {guest.how_they_know}
            </p>
          )}
          {guest.favorite_song && (
            <p className="text-white/70 text-sm">
              🎵 {guest.favorite_song}
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

        {/* Spacer to keep like centered */}
        <div className="w-16" />
      </div>
    </div>
  )
}

export interface Guest {
  id: string
  name: string
  photo_url: string | null
  photos: string[]
  how_they_know: string | null
  favorite_song: string | null  // repurposed as "origin / de dónde eres"
  table_number: string | null
  ready: boolean
  created_at: string
}

export interface Like {
  id: string
  from_name: string
  to_name: string
  created_at: string
}

export interface Match {
  id: string
  guest_a: string
  guest_b: string
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      guests: {
        Row: Guest
        Insert: Omit<Guest, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Guest, 'id' | 'created_at'>>
        Relationships: []
      }
      likes: {
        Row: Like
        Insert: Omit<Like, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Like, 'id' | 'created_at'>>
        Relationships: []
      }
      matches: {
        Row: Match
        Insert: Omit<Match, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Match, 'id' | 'created_at'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

# 💍 Solteros del Matrimonio

App estilo Tinder para invitados solteros de una boda. Swipe, like, y match en tiempo real.

## Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL + Storage + Realtime)
- **Deploy**: Vercel (frontend) + Supabase cloud (gratis)

---

## 1. Crear proyecto en Supabase

Ve a [supabase.com](https://supabase.com) → New project.

### 1.1 Ejecutar el schema SQL

En el **SQL Editor** de tu proyecto, pega y ejecuta:

```sql
-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de invitados
CREATE TABLE guests (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT UNIQUE NOT NULL,
  photo_url   TEXT,
  how_they_know TEXT,
  favorite_song TEXT,
  ready       BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de likes
CREATE TABLE likes (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_name   TEXT NOT NULL REFERENCES guests(name) ON DELETE CASCADE,
  to_name     TEXT NOT NULL REFERENCES guests(name) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_name, to_name)
);

-- Tabla de matches
CREATE TABLE matches (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  guest_a     TEXT NOT NULL REFERENCES guests(name) ON DELETE CASCADE,
  guest_b     TEXT NOT NULL REFERENCES guests(name) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guest_a, guest_b)
);

-- Habilitar RLS
ALTER TABLE guests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas (app de un día, anon key)
CREATE POLICY "guests_all"  ON guests  FOR ALL  USING (true) WITH CHECK (true);
CREATE POLICY "likes_all"   ON likes   FOR ALL  USING (true) WITH CHECK (true);
CREATE POLICY "matches_all" ON matches FOR ALL  USING (true) WITH CHECK (true);

-- Habilitar Realtime para matches (notificaciones en vivo)
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
```

### 1.2 Crear bucket de fotos

1. Ve a **Storage** → **New bucket**
2. Nombre: `photos`
3. Marca **Public bucket** ✓
4. Guarda

---

## 2. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto (copia de `.env.example`):

```env
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...tu_anon_key_aqui
VITE_ADMIN_PASS=la_contraseña_del_admin
```

**Dónde encontrar los valores:**
- `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` → Supabase Dashboard → **Settings** → **API**
- `VITE_ADMIN_PASS` → elige cualquier contraseña segura

---

## 3. Desarrollo local

```bash
npm install
npm run dev
```

La app corre en `http://localhost:5173`

---

## 4. Deploy a Vercel

### Opción A — CLI (más rápido)

```bash
npm install -g vercel
vercel
```

Vercel detecta automáticamente que es un proyecto Vite.

### Opción B — GUI

1. Sube el proyecto a GitHub
2. Ve a [vercel.com](https://vercel.com) → **New Project** → importa el repo
3. En **Environment Variables** añade las tres variables de entorno
4. Click **Deploy**

> ⚠️ Las variables `VITE_*` deben estar en Vercel para que el build las incluya.

---

## 5. Flujo de uso el día de la boda

1. **Admin** entra a `/admin` con la contraseña y añade todos los invitados por nombre
2. Cada invitado escanea el QR / abre la URL, selecciona su nombre y completa el perfil (foto opcional)
3. Cuando el perfil está completo (`ready = true`) aparece en el deck de swipe de los demás
4. Al dar like mutuo → popup de match en tiempo real 🎉

---

## 6. Estructura del proyecto

```
src/
├── components/
│   ├── GuestCard.tsx     # Card de swipe con foto, nombre e info
│   ├── Layout.tsx        # Shell con header y nav inferior
│   └── MatchPopup.tsx    # Popup animado al hacer match
├── hooks/
│   ├── useGuests.ts      # CRUD de invitados
│   ├── useLikes.ts       # Likes + detección de match mutuo
│   └── useMatches.ts     # Matches + suscripción Realtime
├── lib/
│   ├── imageResize.ts    # Redimensiona fotos a 400px en cliente
│   └── supabaseClient.ts # Cliente Supabase tipado
├── pages/
│   ├── Home.tsx          # Bienvenida
│   ├── Login.tsx         # Selección de invitado
│   ├── Setup.tsx         # Subir foto y completar perfil
│   ├── Swipe.tsx         # Deck de swipe principal
│   ├── Matches.tsx       # Lista de matches
│   └── Admin.tsx         # Panel admin (protegido por contraseña)
└── types/
    └── database.ts       # Tipos TypeScript del esquema
```

---

## 7. Notas de seguridad

- La contraseña de admin está en `.env` como `VITE_ADMIN_PASS`. Es validación client-side — suficiente para una app de un día.
- Las keys de Supabase son `anon` (públicas por diseño). RLS protege que solo se puedan hacer las operaciones permitidas.
- No guardes la `service_role` key en el frontend nunca.
- Añade el dominio de Vercel en **Supabase → Authentication → URL Configuration** si usas Row Level Security basada en auth (no requerido en esta versión).

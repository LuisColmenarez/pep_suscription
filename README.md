# Web Site de Registro para Taller (Astro + Vercel + Supabase)

Proyecto 100% gratuito utilizando:
- **Astro**: Framework rápido, ligero y moderno.
- **Tailwind CSS**: Estilo visual elegante en modo oscuro con acentos glassmorphism.
- **Supabase**: Base de datos Postgres gratuita (hasta 500 MB y 50.000 usuarios activos mensuales).
- **Vercel**: Alojamiento y despliegue serverless gratuito (con soporte de APIs Astro).

---

## 🚀 Despliegue en 3 Pasos 100% Gratis

### 1. Crear Base de Datos en Supabase (Gratis)
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita.
2. Crea un nuevo proyecto (ej. `registro-taller`).
3. En el menú lateral, abre **SQL Editor** y pega todo el contenido de `supabase_schema.sql`. Presiona **Run**.
4. Ve a **Project Settings > API** y copia:
   - `Project URL`
   - `anon public key`

### 2. Probar Localmente
```bash
npm install
cp .env.example .env
# Pega tu Project URL y anon key en .env
npm run dev
```

### 3. Subir a Vercel (Gratis)
1. Sube este proyecto a tu GitHub.
2. Inicia sesión en [vercel.com](https://vercel.com) e importa tu repositorio.
3. En la sección **Environment Variables**, añade:
   - `PUBLIC_SUPABASE_URL` = (tu URL de Supabase)
   - `PUBLIC_SUPABASE_ANON_KEY` = (tu clave anon de Supabase)
4. Haz clic en **Deploy**. ¡Listo! Tu web estará funcionando en minutos con HTTPS gratis.

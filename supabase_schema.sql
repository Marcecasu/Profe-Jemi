-- ===================================================
-- PROFE JEMI AI - SCHEMA DE BASE DE DATOS SUPABASE
-- Modelo Freemium + Premium Regionalizado (BRL & USD)
-- ===================================================

-- 1. Tabla de Perfiles
create table if not exists public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  role text default 'user' check (role in ('user', 'admin')),
  subscription_status text default 'free' check (subscription_status in ('free', 'trial', 'active', 'past_due', 'canceled')),
  trial_ends_at timestamptz default (now() + interval '30 days'),
  live_minutes_used integer default 0,
  vision_count_used integer default 0,
  translations_count_used integer default 0,
  usage_reset_at timestamptz default (now() + interval '30 days'),
  stripe_customer_id text,
  subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (id)
);

-- Si la tabla ya existía, añadir columnas faltantes de forma segura
alter table public.profiles add column if not exists live_minutes_used integer default 0;
alter table public.profiles add column if not exists vision_count_used integer default 0;
alter table public.profiles add column if not exists translations_count_used integer default 0;
alter table public.profiles add column if not exists usage_reset_at timestamptz default (now() + interval '30 days');
alter table public.profiles add column if not exists subscription_id text;
alter table public.profiles add column if not exists updated_at timestamptz default now();

-- Actualizar restricción de estado para permitir 'free'
alter table public.profiles drop constraint if exists profiles_subscription_status_check;
alter table public.profiles add constraint profiles_subscription_status_check 
  check (subscription_status in ('free', 'trial', 'active', 'past_due', 'canceled'));

-- 2. Activar Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. Políticas de Acceso
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- 4. Función de creación automática de perfil al registrarse un usuario
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, 
    email, 
    subscription_status, 
    live_minutes_used, 
    vision_count_used, 
    translations_count_used,
    usage_reset_at
  )
  values (
    new.id, 
    new.email, 
    'free', 
    0, 
    0, 
    0,
    now() + interval '30 days'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- 5. Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

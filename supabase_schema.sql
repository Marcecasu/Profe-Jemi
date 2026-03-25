-- Enable RLS
alter table auth.users enable row level security;

-- Create profiles table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  role text default 'user' check (role in ('user', 'admin')),
  subscription_status text default 'trial' check (subscription_status in ('trial', 'active', 'past_due', 'canceled')),
  trial_ends_at timestamptz default (now() + interval '7 days'),
  stripe_customer_id text,
  created_at timestamptz default now(),
  primary key (id)
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, trial_ends_at)
  values (new.id, new.email, now() + interval '7 days');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call handle_new_user
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

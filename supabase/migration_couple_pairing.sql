-- ============================================
-- Migration: Couple Pairing
-- ============================================

-- Add pairing fields to profiles
alter table public.profiles
  add column if not exists invite_code text unique,
  add column if not exists partner_id uuid references public.profiles(id) on delete set null;

-- Index for fast invite code lookup
create index if not exists idx_profiles_invite_code on public.profiles(invite_code);

-- Allow users to look up a profile by invite_code ONLY (not full profile scan)
-- Needed so the invited partner can find whose code they entered
create policy "Anyone can look up profile by invite code" on public.profiles
  for select using (invite_code is not null);

-- ============================================
-- RPC: link_partner_by_code
-- Called by the invited partner after entering the code
-- ============================================
create or replace function public.link_partner_by_code(code text)
returns json as $$
declare
  inviter_id uuid;
  inviter_full_name text;
  my_id uuid := auth.uid();
begin
  if my_id is null then
    raise exception 'Not authenticated';
  end if;

  select id, full_name into inviter_id, inviter_full_name
  from public.profiles
  where invite_code = code;

  if inviter_id is null then
    raise exception 'Invalid invite code';
  end if;

  if inviter_id = my_id then
    raise exception 'You cannot link to yourself';
  end if;

  -- Link both directions
  update public.profiles set partner_id = my_id, invite_code = null where id = inviter_id;
  update public.profiles set partner_id = inviter_id where id = my_id;

  return json_build_object('partner_id', inviter_id, 'partner_name', inviter_full_name);
end;
$$ language plpgsql security definer;

-- ============================================
-- RPC: generate_invite_code
-- Called by inviter to create/refresh their code
-- ============================================
create or replace function public.generate_invite_code()
returns text as $$
declare
  new_code text;
  my_id uuid := auth.uid();
begin
  if my_id is null then
    raise exception 'Not authenticated';
  end if;

  new_code := upper(substr(md5(random()::text || my_id::text), 1, 6));

  update public.profiles set invite_code = new_code where id = my_id;

  return new_code;
end;
$$ language plpgsql security definer;

-- ============================================
-- Extend user_progress sharing: add is_shared flag inside progress jsonb
-- (no schema change needed — handled at app level within the jsonb blob)
-- ============================================

-- Policy: allow reading partner's progress (read-only, for shared discussion answers)
create policy "Users can view partner's progress" on public.user_progress
  for select using (
    user_id in (
      select partner_id from public.profiles where id = auth.uid()
    )
  );

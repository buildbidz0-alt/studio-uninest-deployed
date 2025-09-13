
-- Drop existing policies and functions to ensure a clean slate
DROP POLICY IF EXISTS "Enable read access for user's own rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Enable read for participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Enable read for participants" ON public.chat_messages;
DROP FUNCTION IF EXISTS is_chat_participant(uuid, uuid);
DROP FUNCTION IF EXISTS get_user_chat_rooms();

-- Helper function to check if a user is in a specific chat room.
-- This is crucial to break the infinite recursion loop.
create or replace function is_chat_participant(room_id_to_check uuid)
returns boolean
language sql
security definer
as $$
  select exists (
    select 1
    from chat_participants
    where chat_participants.room_id = room_id_to_check
    and chat_participants.user_id = auth.uid()
  );
$$;

-- Policies for chat_rooms
CREATE POLICY "Enable read access for user's own rooms" ON public.chat_rooms
FOR SELECT USING (is_chat_participant(id));

-- Policies for chat_participants
CREATE POLICY "Enable read for participants" ON public.chat_participants
FOR SELECT USING (is_chat_participant(room_id));

-- Policies for chat_messages
CREATE POLICY "Enable read for participants" ON public.chat_messages
FOR SELECT USING (is_chat_participant(room_id));
CREATE POLICY "Enable insert for participants" ON public.chat_messages
FOR INSERT WITH CHECK (is_chat_participant(room_id) AND auth.uid() = user_id);

-- Function to get all chat rooms for the current user.
-- This simplifies client-side logic immensely.
create or replace function get_user_chat_rooms()
returns table (
    id uuid,
    created_at timestamptz,
    name text,
    avatar text,
    last_message text,
    last_message_timestamp timestamptz,
    unread_count int
)
language sql
security definer
as $$
with user_rooms as (
  select room_id from chat_participants where user_id = auth.uid()
),
other_participants as (
  select
    cp.room_id,
    p.full_name,
    p.avatar_url
  from chat_participants cp
  join profiles p on cp.user_id = p.id
  where cp.room_id in (select room_id from user_rooms) and cp.user_id != auth.uid()
),
last_messages as (
  select distinct on (room_id)
    room_id,
    content,
    created_at
  from chat_messages
  where room_id in (select room_id from user_rooms)
  order by room_id, created_at desc
)
select
  ur.room_id as id,
  cr.created_at,
  op.full_name as name,
  op.avatar_url as avatar,
  lm.content as last_message,
  lm.created_at as last_message_timestamp,
  0 as unread_count -- Placeholder for unread count
from user_rooms ur
join chat_rooms cr on ur.room_id = cr.id
left join other_participants op on ur.room_id = op.room_id
left join last_messages lm on ur.room_id = lm.room_id
order by lm.created_at desc;
$$;

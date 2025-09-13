
-- Drop existing policies and functions if they exist to ensure a clean slate
DROP POLICY IF EXISTS "Users can see participants of rooms they are in" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can only insert their own participation" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can read messages in their chats" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can only insert their own messages" ON public.chat_messages;
DROP FUNCTION IF EXISTS public.get_or_create_chat_room(uuid, uuid);
DROP FUNCTION IF EXISTS public.get_last_messages_for_rooms(uuid[]);
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    handle text UNIQUE,
    bio text,
    role text DEFAULT 'student',
    vendor_categories text[],
    opening_hours text,
    banner_url text
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Function to create a public profile for a new user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, handle, role, vendor_categories)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'handle',
    new.raw_user_meta_data->>'role',
    (select array_agg(elem::text) from jsonb_array_elements_text(new.raw_user_meta_data->'vendor_categories'))
  );
  return new;
end;
$$;

-- Trigger for new user function
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    description text NOT NULL,
    price numeric NOT NULL,
    image_url text,
    category text NOT NULL,
    seller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone." ON public.products FOR SELECT USING (true);
CREATE POLICY "Users can insert their own products." ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update their own products." ON public.products FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Users can delete their own products." ON public.products FOR DELETE USING (auth.uid() = seller_id);


-- Chat Rooms Table
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view rooms they are a participant in" ON public.chat_rooms FOR SELECT USING (
    id IN (
        SELECT room_id FROM public.chat_participants WHERE user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert rooms if they are a participant" on public.chat_rooms for insert with check (
    (select auth.uid()) IN (
        SELECT user_id FROM jsonb_populate_recordset(null::public.chat_participants, (SELECT participants FROM new))
    )
);


-- Chat Participants Table
CREATE TABLE IF NOT EXISTS public.chat_participants (
    room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (room_id, user_id)
);
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see participants of rooms they are in" ON public.chat_participants FOR SELECT USING (
    room_id IN (
        SELECT room_id FROM public.chat_participants WHERE user_id = auth.uid()
    )
);
CREATE POLICY "Users can only insert their own participation" ON public.chat_participants FOR INSERT WITH CHECK (user_id = auth.uid());


-- Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    content text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read messages in their chats" ON public.chat_messages FOR SELECT USING (
    room_id IN (
        SELECT room_id FROM public.chat_participants WHERE user_id = auth.uid()
    )
);
CREATE POLICY "Users can only insert their own messages" ON public.chat_messages FOR INSERT WITH CHECK (user_id = auth.uid());


-- RPC Function to get or create a chat room
CREATE OR REPLACE FUNCTION public.get_or_create_chat_room(p_user_id1 uuid, p_user_id2 uuid)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    v_room_id uuid;
BEGIN
    -- Find a room where both users are participants
    SELECT p1.room_id INTO v_room_id
    FROM chat_participants p1
    JOIN chat_participants p2 ON p1.room_id = p2.room_id
    WHERE p1.user_id = p_user_id1 AND p2.user_id = p_user_id2;

    -- If a room is not found, create one
    IF v_room_id IS NULL THEN
        INSERT INTO chat_rooms DEFAULT VALUES RETURNING id INTO v_room_id;
        INSERT INTO chat_participants (room_id, user_id) VALUES (v_room_id, p_user_id1);
        INSERT INTO chat_participants (room_id, user_id) VALUES (v_room_id, p_user_id2);
    END IF;

    RETURN v_room_id;
END;
$$;

-- RPC Function to get last message
CREATE OR REPLACE FUNCTION public.get_last_messages_for_rooms(p_room_ids uuid[])
RETURNS TABLE(room_id uuid, content text, created_at timestamptz)
LANGUAGE sql
AS $$
    SELECT
        t.room_id,
        t.content,
        t.created_at
    FROM (
        SELECT
            cm.room_id,
            cm.content,
            cm.created_at,
            ROW_NUMBER() OVER(PARTITION BY cm.room_id ORDER BY cm.created_at DESC) as rn
        FROM chat_messages cm
        WHERE cm.room_id = ANY(p_room_ids)
    ) t
    WHERE t.rn = 1;
$$;

-- Followers Table
CREATE TABLE IF NOT EXISTS public.followers (
    follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (follower_id, following_id)
);
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Followers are public" ON public.followers FOR SELECT USING (true);
CREATE POLICY "Users can manage their own follow relationships" ON public.followers FOR ALL USING (auth.uid() = follower_id);


-- Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    content text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create their own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage any post" ON public.posts FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    content text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    post_id bigint NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are public" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can insert their own comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);


-- Likes Table
CREATE TABLE IF NOT EXISTS public.likes (
    post_id bigint NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (post_id, user_id)
);
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes are public" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own likes" ON public.likes FOR ALL USING (auth.uid() = user_id);


-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type text NOT NULL,
    post_id bigint REFERENCES public.posts(id) ON DELETE CASCADE,
    is_read boolean DEFAULT false NOT NULL
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);


-- Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    buyer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vendor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_amount numeric NOT NULL,
    status text DEFAULT 'Pending',
    razorpay_payment_id text
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = vendor_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);


-- Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    order_id bigint NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id bigint NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity integer NOT NULL,
    price numeric NOT NULL
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view items in their orders" ON public.order_items FOR SELECT USING (
    order_id IN (SELECT id FROM public.orders WHERE buyer_id = auth.uid() OR vendor_id = auth.uid())
);
CREATE POLICY "Users can insert items for their own orders" ON public.order_items FOR INSERT WITH CHECK (
    order_id IN (SELECT id FROM public.orders WHERE buyer_id = auth.uid())
);


-- Donations Table
CREATE TABLE IF NOT EXISTS public.donations (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id uuid REFERENCES public.profiles(id),
    amount integer NOT NULL,
    currency character(3) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    razorpay_payment_id text
);
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Donations can be viewed by admins and the donor" ON public.donations FOR SELECT USING (
    auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "All users can view aggregated donor list" ON public.donations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can make donations" ON public.donations FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- Platform Settings Table
CREATE TABLE IF NOT EXISTS public.platform_settings (
    key text PRIMARY KEY,
    value jsonb,
    updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platform settings are readable by everyone" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update settings" ON public.platform_settings FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
-- Initial monetization settings
INSERT INTO public.platform_settings (key, value) VALUES ('monetization', '{"charge_for_posts": false, "post_price": 10, "start_date": null}') ON CONFLICT (key) DO NOTHING;

-- Competitions Table
CREATE TABLE IF NOT EXISTS public.competitions (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title text NOT NULL,
    description text NOT NULL,
    prize numeric NOT NULL,
    entry_fee numeric NOT NULL,
    deadline timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    image_url text,
    details_pdf_url text
);
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Competitions are viewable by everyone" ON public.competitions FOR SELECT USING (true);
CREATE POLICY "Admins can manage competitions" ON public.competitions FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Competition Entries Table
CREATE TABLE IF NOT EXISTS public.competition_entries (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    competition_id bigint NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    razorpay_payment_id text,
    UNIQUE(competition_id, user_id)
);
ALTER TABLE public.competition_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own entries" ON public.competition_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can register for competitions" ON public.competition_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all entries" ON public.competition_entries FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Internships Table
CREATE TABLE IF NOT EXISTS public.internships (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    role text NOT NULL,
    company text NOT NULL,
    stipend numeric NOT NULL,
    stipend_period text,
    location text NOT NULL,
    deadline timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    image_url text,
    details_pdf_url text
);
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Internships are viewable by everyone" ON public.internships FOR SELECT USING (true);
CREATE POLICY "Admins can manage internships" ON public.internships FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);


-- Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category text NOT NULL,
    subject text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'Open',
    priority text DEFAULT 'Medium',
    screenshot_url text
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own support tickets" ON public.support_tickets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all tickets" ON public.support_tickets FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- App Config Table
CREATE TABLE IF NOT EXISTS public.app_config (
    key text PRIMARY KEY,
    value text
);
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "App config is public" ON public.app_config FOR SELECT USING (true);
CREATE POLICY "Admins can manage app config" ON public.app_config FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
-- Initial donation goal
INSERT INTO public.app_config (key, value) VALUES ('donation_goal', '50000') ON CONFLICT (key) DO NOTHING;

-- Audit Log Table
CREATE TABLE IF NOT EXISTS public.audit_log (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    admin_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action text NOT NULL,
    details text
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON public.audit_log FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Enable realtime for chat messages
alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table donations;

-- Enable full-text search indexes
CREATE INDEX IF NOT EXISTS products_name_fts_idx ON public.products USING gin (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS profiles_full_name_fts_idx ON public.profiles USING gin (to_tsvector('english', full_name));


-- ================================================================================================
--                              POSTGRESQL APP DATABASE SCHEMA
-- ================================================================================================
-- This file is a reference for the database schema. It is not used to create the database.
-- The database is managed by Supabase, and this file is for reference purposes only.
--
-- For local development, you can use the Supabase CLI to pull the schema from the cloud:
-- `supabase db pull`
--
-- To apply local changes to the cloud, you can use the Supabase CLI:
-- `supabase db push`
-- ================================================================================================


-- ================================================================================================
--                                             TABLES
-- ================================================================================================

--
-- Profiles
--
CREATE TABLE profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    role text,
    handle text UNIQUE,
    bio text,
    contact_number text,
    vendor_categories text[],
    opening_hours text,
    banner_url text
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

--
-- Products (Marketplace Listings)
--
CREATE TABLE products (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    price numeric NOT NULL,
    image_url text,
    category text NOT NULL,
    seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    description text
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

--
-- Posts (Social Feed)
--
CREATE TABLE posts (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    content text NOT NULL,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

--
-- Likes (For Posts)
--
CREATE TABLE likes (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id bigint NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE (user_id, post_id)
);
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

--
-- Comments (For Posts)
--
CREATE TABLE comments (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    content text NOT NULL,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id bigint NOT NULL REFERENCES posts(id) ON DELETE CASCADE
);
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

--
-- Followers
--
CREATE TABLE followers (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    follower_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    UNIQUE (follower_id, following_id)
);
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;


--
-- Chat Rooms
--
CREATE TABLE chat_rooms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

--
-- Chat Participants
--
CREATE TABLE chat_participants (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    UNIQUE(room_id, user_id)
);
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;


--
-- Chat Messages
--
CREATE TABLE chat_messages (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    content text NOT NULL,
    room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

--
-- Orders
--
CREATE TABLE orders (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    buyer_id uuid NOT NULL REFERENCES profiles(id),
    vendor_id uuid NOT NULL REFERENCES profiles(id),
    total_amount numeric NOT NULL,
    razorpay_payment_id text,
    status text DEFAULT 'Pending'::text
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;


--
-- Order Items
--
CREATE TABLE order_items (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    order_id bigint NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id bigint NOT NULL REFERENCES products(id) ON DELETE SET NULL,
    quantity integer NOT NULL,
    price numeric NOT NULL
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

--
-- Notifications
--
CREATE TABLE notifications (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type text NOT NULL,
    post_id bigint REFERENCES posts(id) ON DELETE CASCADE,
    is_read boolean NOT NULL DEFAULT false
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

--
-- Platform Settings
--
CREATE TABLE platform_settings (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    key text UNIQUE NOT NULL,
    value jsonb
);
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

--
-- Competitions
--
CREATE TABLE competitions (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    title text NOT NULL,
    description text,
    prize numeric,
    deadline timestamp with time zone,
    entry_fee numeric,
    image_url text,
    details_pdf_url text
);
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

--
-- Competition Entries
--
CREATE TABLE competition_entries (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    competition_id bigint REFERENCES competitions(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    razorpay_payment_id text,
    UNIQUE (competition_id, user_id)
);
ALTER TABLE competition_entries ENABLE ROW LEVEL SECURITY;

--
-- Internships
--
CREATE TABLE internships (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    role text NOT NULL,
    company text NOT NULL,
    stipend numeric NOT NULL,
    stipend_period text,
    location text NOT NULL,
    deadline timestamp with time zone,
    image_url text,
    details_pdf_url text
);
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;

--
-- Donations
--
CREATE TABLE donations (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id uuid REFERENCES auth.users(id),
    amount numeric NOT NULL,
    currency text,
    razorpay_payment_id text
);
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;


--
-- Support Tickets
--
CREATE TABLE support_tickets (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    category text,
    subject text,
    description text,
    status text DEFAULT 'Open'::text,
    priority text DEFAULT 'Medium'::text,
    screenshot_url text
);
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

--
-- Audit Log
--
CREATE TABLE audit_log (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    admin_id uuid NOT NULL REFERENCES auth.users(id),
    action text,
    details text
);
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

--
-- App Config
--
CREATE TABLE app_config (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    key text UNIQUE NOT NULL,
    value text
);
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- ================================================================================================
--                                             RLS POLICIES
-- ================================================================================================

--
-- Policies for 'profiles'
--
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

--
-- Policies for 'products'
--
CREATE POLICY "Products are viewable by everyone." ON products FOR SELECT USING (true);
CREATE POLICY "Users can create product listings." ON products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update their own listings." ON products FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Users can delete their own listings." ON products FOR DELETE USING (auth.uid() = seller_id);

--
-- Policies for 'posts'
--
CREATE POLICY "Posts are viewable by everyone." ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts." ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts." ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts." ON posts FOR DELETE USING (auth.uid() = user_id);

--
-- Policies for 'likes'
--
CREATE POLICY "Likes are viewable by everyone." ON likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts." ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike their own likes." ON likes FOR DELETE USING (auth.uid() = user_id);

--
-- Policies for 'comments'
--
CREATE POLICY "Comments are viewable by everyone." ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments." ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments." ON comments FOR DELETE USING (auth.uid() = user_id);

--
-- Policies for 'followers'
--
CREATE POLICY "Follower relationships are public." ON followers FOR SELECT USING (true);
CREATE POLICY "Users can follow other users." ON followers FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow users." ON followers FOR DELETE USING (auth.uid() = follower_id);

--
-- Policies for 'chat_rooms', 'chat_participants', 'chat_messages'
--
CREATE POLICY "Users can view rooms they are a participant in." ON chat_rooms FOR SELECT USING (
    id IN (
        SELECT room_id FROM chat_participants WHERE user_id = auth.uid()
    )
);
CREATE POLICY "Users can create chat rooms." ON chat_rooms FOR INSERT WITH CHECK (true); -- More specific checks are on participants

CREATE POLICY "Users can view participants of rooms they are in." ON chat_participants FOR SELECT USING (
    room_id IN (
        SELECT room_id FROM chat_participants WHERE user_id = auth.uid()
    )
);
CREATE POLICY "Users can add themselves to a room." ON chat_participants FOR INSERT WITH CHECK (user_id = auth.uid());


CREATE POLICY "Users can view messages in rooms they are in." ON chat_messages FOR SELECT USING (
    room_id IN (
        SELECT room_id FROM chat_participants WHERE user_id = auth.uid()
    )
);
CREATE POLICY "Users can send messages in rooms they are in." ON chat_messages FOR INSERT WITH CHECK (
    user_id = auth.uid() AND room_id IN (
        SELECT room_id FROM chat_participants WHERE user_id = auth.uid()
    )
);

--
-- Policies for 'orders' & 'order_items'
--
CREATE POLICY "Users can view their own orders." ON orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = vendor_id);
CREATE POLICY "Users can create orders." ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can view items of orders they are part of." ON order_items FOR SELECT USING (
    order_id IN (
        SELECT id FROM orders WHERE (buyer_id = auth.uid() OR vendor_id = auth.uid())
    )
);
CREATE POLICY "Users can insert items for their own orders." ON order_items FOR INSERT WITH CHECK (
    order_id IN (
        SELECT id FROM orders WHERE buyer_id = auth.uid()
    )
);

--
-- Policies for 'notifications'
--
CREATE POLICY "Users can view their own notifications." ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications (e.g., mark as read)." ON notifications FOR UPDATE USING (auth.uid() = user_id);
-- Insert handled by database triggers/functions

--
-- Policies for 'platform_settings'
--
CREATE POLICY "Settings are public." ON platform_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update settings." ON platform_settings FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

--
-- Policies for 'competitions'
--
CREATE POLICY "Competitions are public." ON competitions FOR SELECT USING (true);
CREATE POLICY "Admins can manage competitions." ON competitions FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

--
-- Policies for 'competition_entries'
--
CREATE POLICY "Users can view their own entries." ON competition_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can enter competitions." ON competition_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

--
-- Policies for 'internships'
--
CREATE POLICY "Internships are public." ON internships FOR SELECT USING (true);
CREATE POLICY "Admins can manage internships." ON internships FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

--
-- Policies for 'donations'
--
CREATE POLICY "Donations are public." ON donations FOR SELECT USING (true);
CREATE POLICY "Users can make donations." ON donations FOR INSERT WITH CHECK (auth.uid() = user_id);

--
-- Policies for 'support_tickets'
--
CREATE POLICY "Users can create support tickets." ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all support tickets." ON support_tickets FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

--
-- Policies for 'audit_log'
--
CREATE POLICY "Admins can view audit logs." ON audit_log FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
-- Inserts are handled by security definer functions

--
-- Policies for 'app_config'
--
CREATE POLICY "App config is public." ON app_config FOR SELECT USING (true);
CREATE POLICY "Admins can manage app config." ON app_config FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- ================================================================================================
--                                         DATABASE FUNCTIONS
-- ================================================================================================

--
-- Function to create a user profile upon signup
--
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, handle, vendor_categories)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'role',
    COALESCE(NEW.raw_user_meta_data->>'handle', split_part(NEW.email, '@', 1) || '_' || substr(md5(random()::text), 1, 4)),
    (select array_agg(elem::text) from jsonb_array_elements_text(NEW.raw_user_meta_data->'vendor_categories'))
  );
  RETURN NEW;
END;
$$;

--
-- Trigger for the new user function
--
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


--
-- Function to get or create a chat room between two users
--
CREATE OR REPLACE FUNCTION get_or_create_chat_room(p_user_id1 uuid, p_user_id2 uuid)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    v_room_id uuid;
BEGIN
    -- Find a room that has exactly these two participants
    SELECT p1.room_id INTO v_room_id
    FROM chat_participants p1
    JOIN chat_participants p2 ON p1.room_id = p2.room_id
    WHERE p1.user_id = p_user_id1 AND p2.user_id = p_user_id2;

    -- If no room is found, create one
    IF v_room_id IS NULL THEN
        INSERT INTO chat_rooms DEFAULT VALUES RETURNING id INTO v_room_id;
        INSERT INTO chat_participants (room_id, user_id) VALUES (v_room_id, p_user_id1);
        INSERT INTO chat_participants (room_id, user_id) VALUES (v_room_id, p_user_id2);
    END IF;

    RETURN v_room_id;
END;
$$;

--
-- Function to create a notification when a user follows another
--
CREATE OR REPLACE FUNCTION public.create_follower_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Create a notification for the user who is being followed
    INSERT INTO public.notifications (user_id, sender_id, type)
    VALUES (NEW.following_id, NEW.follower_id, 'new_follower');

    RETURN NEW;
END;
$$;

--
-- Trigger for the follower notification function
--
CREATE OR REPLACE TRIGGER on_new_follower
  AFTER INSERT ON public.followers
  FOR EACH ROW EXECUTE PROCEDURE public.create_follower_notification();

--
-- Function to create notifications when a user creates a new post
--
CREATE OR REPLACE FUNCTION public.create_post_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Insert a notification for each follower of the user who created the post
    INSERT INTO public.notifications (user_id, sender_id, type, post_id)
    SELECT
        f.follower_id,  -- The user to be notified is the follower
        NEW.user_id,    -- The sender of the notification is the user who made the post
        'new_post',     -- The type of notification
        NEW.id          -- The ID of the new post
    FROM
        public.followers f
    WHERE
        f.following_id = NEW.user_id; -- Find all users who follow the post creator

    RETURN NEW;
END;
$$;

--
-- Trigger for the post notification function
--
CREATE OR REPLACE TRIGGER on_new_post
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE PROCEDURE public.create_post_notifications();

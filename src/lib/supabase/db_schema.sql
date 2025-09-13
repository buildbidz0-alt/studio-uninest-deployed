-- Drop existing policies and functions to start clean if they exist
DO $$
BEGIN
   IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view their own chat rooms.' AND polrelid = 'public.chat_rooms'::regclass) THEN
      DROP POLICY "Users can view their own chat rooms." ON public.chat_rooms;
   END IF;
   IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view participants of their own chat rooms.' AND polrelid = 'public.chat_participants'::regclass) THEN
      DROP POLICY "Users can view participants of their own chat rooms." ON public.chat_participants;
   END IF;
   IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can access messages in their own chat rooms.' AND polrelid = 'public.chat_messages'::regclass) THEN
      DROP POLICY "Users can access messages in their own chat rooms." ON public.chat_messages;
   END IF;
   IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_chat_participant') THEN
      DROP FUNCTION public.is_chat_participant(uuid);
   END IF;
END
$$;

-- Create the orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    buyer_id uuid REFERENCES public.profiles(id),
    vendor_id uuid REFERENCES public.profiles(id),
    total_amount numeric(10, 2) NOT NULL,
    razorpay_payment_id text,
    status text DEFAULT 'Pending'::text
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create the order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    order_id bigint REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id integer REFERENCES public.products(id) ON DELETE SET NULL,
    quantity integer NOT NULL DEFAULT 1,
    price numeric(10, 2) NOT NULL
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;


-- POLICIES for orders and order_items
CREATE POLICY "Users can view their own orders."
ON public.orders
FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = vendor_id);

CREATE POLICY "Users can view items of their own orders."
ON public.order_items
FOR SELECT USING (
    (SELECT buyer_id FROM public.orders WHERE id = order_id) = auth.uid() OR
    (SELECT vendor_id FROM public.orders WHERE id = order_id) = auth.uid()
);

-- CHAT SYSTEM
-- Function to check if a user is a participant in a room
CREATE OR REPLACE FUNCTION public.is_chat_participant(p_room_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_participants
    WHERE room_id = p_room_id AND user_id = auth.uid()
  );
$$;

-- Policies for chat
CREATE POLICY "Users can view their own chat rooms." ON public.chat_rooms
FOR SELECT USING (public.is_chat_participant(id));

CREATE POLICY "Users can view participants of their own chat rooms." ON public.chat_participants
FOR SELECT USING (public.is_chat_participant(room_id));

CREATE POLICY "Users can access messages in their own chat rooms." ON public.chat_messages
FOR ALL USING (public.is_chat_participant(room_id));

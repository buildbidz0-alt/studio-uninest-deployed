
import type { User } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  handle: string | null;
};

export type Room = {
  id: string;
  created_at: string;
  participants: {
    profile: Profile
  }[];
  // Computed properties, not in DB
  name?: string;
  avatar?: string;
  lastMessage?: Message | null;
};

export type Message = {
  id: string;
  content: string;
  created_at: string;
  room_id: string;
  user_id: string;
  profile: Profile | null;
};

export type Product = {
  id: number;
  created_at: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  seller_id: string;
  description: string;
  seller: {
    full_name: string;
  } | null;
  // This field is for the raw query result
  profiles?: {
    full_name: string;
  } | null;
};

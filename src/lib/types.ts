
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

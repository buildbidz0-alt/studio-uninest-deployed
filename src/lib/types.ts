
import type { User } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  handle: string | null;
  bio?: string | null;
  followers?: { count: number }[];
  following?: { count: number }[];
};

export type Room = {
  id: string;
  created_at: string;
  // Computed properties from DB function
  name: string | null;
  avatar: string | null;
  last_message: string | null;
  last_message_timestamp: string | null;
  // Computed on client
  unreadCount?: number;
  participants?: { profile: Profile }[]; // Keep for compatibility if needed elsewhere
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
  };
  // This field is for the raw query result
  profiles?: {
    full_name: string;
  };
};

export type Note = {
  id: number;
  created_at: string;
  user_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  tags: string[] | null;
  profiles: {
    full_name: string;
    avatar_url: string;
  } | null;
}

export type Order = {
  id: number;
  created_at: string;
  buyer_id: string;
  vendor_id: string;
  total_amount: number;
  razorpay_payment_id: string;
  order_items: OrderItem[];
  buyer: Profile;
}

export type OrderItem = {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price: number;
    products: {
        name: string;
        image_url: string | null;
    }
}

export type Notification = {
    id: number;
    created_at: string;
    user_id: string;
    sender_id: string;
    type: 'new_follower' | 'new_post';
    post_id: number | null;
    is_read: boolean;
    sender: {
        full_name: string;
        avatar_url: string;
    } | null;
}

export type PostWithAuthor = {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  likes: { count: number }[];
  comments: any[]; 
  profiles: {
    full_name: string;
    avatar_url: string;
    handle: string;
  } | null;
  isLiked: boolean;
  isFollowed: boolean;
};

export type MonetizationSettings = {
    charge_for_posts: boolean;
    post_price: number;
    start_date: string | null;
};

export type SupportTicket = {
  id: number;
  created_at: string;
  user_id: string;
  category: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Closed' | 'Archived';
  priority: 'Low' | 'Medium' | 'High';
  screenshot_url?: string | null;
};

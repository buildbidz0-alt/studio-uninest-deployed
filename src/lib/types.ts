
export type Room = {
  id: string;
  name: string;
  lastMessage: string;
  unreadCount: number;
  timestamp: string;
};

export type Message = {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
};

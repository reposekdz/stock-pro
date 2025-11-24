


export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  followers: number;
  following: number;
  bio?: string; // Added bio
  coverUrl?: string; // Added cover image
}

export interface Collaborator extends User {
  role: 'owner' | 'editor' | 'viewer';
  email?: string; // Added for invite logic
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  timestamp: string;
  likes: number;     // Added likes count
  liked: boolean;    // Added liked state
}

export interface ImageEditSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  filter: string; // 'none' | 'vivid' | 'noir' | 'vintage' ...
}

export interface Pin {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  author: User;
  width: number;
  height: number;
  tags: string[];
  likes: number;
  comments?: Comment[];
  location?: string;
  scheduledFor?: string;
  editSettings?: ImageEditSettings; // Store visual edits
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  pins: string[]; // Pin IDs
  isPrivate: boolean;
  collaborators: Collaborator[];
  createdAt: string;
}

export interface Filter {
  label: string;
  value: string;
  type: 'color' | 'style' | 'category';
}

export interface Story {
  id: string;
  user: User;
  imageUrl: string;
  timestamp: string;
  viewed: boolean;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  user: User;
  text: string;
  timestamp: string;
  read: boolean;
  imageUrl?: string;
}

// --- Messaging Types ---
export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: 'text' | 'image' | 'voice' | 'pin';
  mediaUrl?: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  user: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
  isOnline: boolean;
}

export enum ViewState {
  HOME = 'HOME',
  SEARCH = 'SEARCH',
  PROFILE = 'PROFILE',
  BOARD = 'BOARD',
  USER_PROFILE = 'USER_PROFILE',
  VISUAL_SEARCH = 'VISUAL_SEARCH',
  SETTINGS = 'SETTINGS',
  MESSAGES = 'MESSAGES' // Added
}
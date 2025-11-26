
export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  followers: number;
  following: number;
  bio?: string;
  coverUrl?: string;
  isCreator?: boolean;
  location?: string;
  links?: { label: string; url: string }[];
  monetizationEligibility?: {
      watchHours: number;
      requiredWatchHours: number;
      eligible: boolean;
  };
  subscriptionPrice?: number; // Monthly price for exclusive content
  subscriberCount?: number;
}

export interface Collaborator extends User {
  role: 'owner' | 'editor' | 'viewer';
  email?: string;
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  timestamp: string;
  likes: number;
  liked: boolean;
}

export interface ImageEditSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  filter: string;
  rotation: number;
  scale: number;
  cropX: number;
  cropY: number;
  aspectRatio: string;
}

export interface VideoEditSettings {
    trimStart: number; // 0-100 percentage
    trimEnd: number; // 0-100 percentage
    volume: number;
    speed: number;
    hasCaptions: boolean;
    filter?: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    currency: string;
    imageUrl: string;
    affiliateLink: string;
}

export interface MonetizationSettings {
    adsEnabled: boolean;
    isSubscriberOnly: boolean;
    estimatedEarnings?: number;
    isPromoted?: boolean; // New for Sponsors
    sponsorName?: string; // Brand name
    campaignId?: string;
}

export interface PinSlide {
    id: string;
    type: 'image' | 'video';
    url: string;
    description?: string;
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
  editSettings?: Partial<ImageEditSettings>;
  videoSettings?: Partial<VideoEditSettings>;
  taggedProducts?: Product[];
  isExclusive?: boolean; // For subscribers
  
  // Video & Monetization Fields
  type: 'image' | 'video' | 'idea';
  videoUrl?: string;
  slides?: PinSlide[]; // For Idea Pins (Carousels)
  duration?: string; // e.g. "0:45"
  monetization?: MonetizationSettings;
  viewCount?: number;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  pins: string[];
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
  videoUrl?: string;
  duration?: number;
  products?: Product[];
  isExclusive?: boolean;
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
export interface PollOption {
    id: string;
    text: string;
    votes: number;
    voters: string[]; // User IDs
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  timestamp: string;
  type: 'text' | 'image' | 'voice' | 'file' | 'sticker' | 'pin' | 'poll' | 'system';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: string;
  duration?: string; // For voice notes (e.g. "0:14")
  read: boolean; // Kept for backward compatibility
  status?: MessageStatus;
  edited?: boolean;
  replyTo?: {
      id: string;
      username: string;
      text: string;
      type: string;
  };
  reactions?: { emoji: string; count: number; userReacted: boolean }[];
  poll?: {
      question: string;
      options: PollOption[];
      totalVotes: number;
      userVotedOptionId?: string;
  };
}

export interface Conversation {
  id: string;
  user: User; // For 1:1, this is the other user. For Groups, a dummy user or primary admin
  isGroup?: boolean;
  groupName?: string;
  groupImage?: string;
  participants?: User[];
  admins?: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
  isOnline: boolean;
  pinnedMessageId?: string;
}

export enum ViewState {
  HOME = 'HOME',
  SEARCH = 'SEARCH',
  PROFILE = 'PROFILE',
  BOARD = 'BOARD',
  USER_PROFILE = 'USER_PROFILE',
  VISUAL_SEARCH = 'VISUAL_SEARCH',
  SETTINGS = 'SETTINGS',
  MESSAGES = 'MESSAGES',
  MONETIZATION = 'MONETIZATION'
}

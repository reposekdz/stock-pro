export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  followers: number;
  following: number;
}

export interface Collaborator extends User {
  role: 'owner' | 'editor' | 'viewer';
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  timestamp: string;
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

export enum ViewState {
  HOME = 'HOME',
  SEARCH = 'SEARCH',
  PROFILE = 'PROFILE',
  BOARD = 'BOARD',
  USER_PROFILE = 'USER_PROFILE',
  VISUAL_SEARCH = 'VISUAL_SEARCH'
}
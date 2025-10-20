// types.ts
export interface User {
  id: string;
  name?: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author?: { name?: string };
  replies?: Comment[];
}

export interface Post {
  id: string;
  content: string;
  createdAt: string;
  author?: { name?: string };
  comments?: Comment[];
}

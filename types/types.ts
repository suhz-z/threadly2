// types.ts
export interface User {
  id: string;
  name?: string;
}

export interface Comment {
  id: string;
  content: string;
  author?: User;
  replies?: Comment[];
  parentId?: string | null;
}

export interface Post {
  id: string;
  content: string;
  author?: User;
  comments: Comment[];
}

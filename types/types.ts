//  TypeScript type definitions for the application
// Defines interfaces for User, Comment, and Post entities used throughout the app

// User interface - represents a user in the system
export interface User {
  id: string; // Unique identifier for the user
  name?: string; // Optional display name
}

// Comment interface - represents a comment on a post (supports nested replies)
export interface Comment {
  id: string; 
  content: string; 
  createdAt: string; 
  author?: { name?: string }; 
  replies?: Comment[]; 
}

// Post interface - represents a post in the feed
export interface Post {
  id: string; 
  content: string; 
  createdAt: string; 
  author?: { name?: string }; 
  comments?: Comment[]; 
  commentCount?: number;
}

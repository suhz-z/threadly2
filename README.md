# Threadly - Social Media Application

Threadly is a modern social media platform built with Next.js, featuring posts, comments, and user authentication. Users can create posts, comment on them, and engage in threaded conversations.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Password Hashing**: bcrypt
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Themes**: next-themes for dark/light mode

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables. Create a `.env.local` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/threadly"
DIRECT_URL="postgresql://username:password@localhost:5432/threadly"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

3. Run Prisma migrations to set up the database schema:

```bash
npx prisma migrate dev
```

4. Generate Prisma client:

```bash
npx prisma generate
```

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Schema

The application uses three main models:

### User Model
- `id`: Unique CUID identifier
- `name`: Optional display name
- `email`: Unique email address (used for authentication)
- `password`: Hashed password
- `posts`: One-to-many relationship with posts
- `comments`: One-to-many relationship with comments

### Post Model
- `id`: Unique CUID identifier
- `content`: Text content of the post
- `author`: Foreign key to User
- `authorId`: Author user ID
- `createdAt`: Auto-generated timestamp
- `comments`: One-to-many relationship with comments

### Comment Model
- `id`: Unique CUID identifier
- `content`: Text content of the comment
- `author`: Foreign key to User
- `authorId`: Comment author user ID
- `post`: Foreign key to Post
- `postId`: Post this comment belongs to
- `parentId`: Parent comment ID (null for top-level comments)
- `parent`: Self-referencing relationship for replies
- `replies`: Nested replies (self-referencing)
- `createdAt`: Auto-generated timestamp

### Relationships
- User → Posts (1:N)
- User → Comments (1:N)
- Post → Comments (1:N)
- Comment → Comment (self-referencing for nested replies)

## API Endpoints

### Posts
- `GET /api/posts`: Fetch all posts with their nested comments
- `POST /api/posts`: Create a new post (requires authentication)
  - Body: `{ "content": "Post content" }`

### Comments
- `POST /api/comments`: Create a new comment or reply (requires authentication)
  - Body: `{ "postId": "post-id", "parentId": "parent-comment-id" (optional), "content": "Comment content", "userEmail": "user@example.com" }`

### Authentication
- `POST /api/auth/[...nextauth]`: NextAuth authentication endpoints
  - Supports login with email/password credentials

### Signup
- `POST /api/signup`: User registration
  - Body: `{ "name": "User Name", "email": "user@example.com", "password": "password" }`

## Authentication Flow

Threadly uses NextAuth.js for authentication with a credentials provider:

1. **Registration**: Users sign up via `/api/signup` endpoint, which hashes passwords with bcrypt and stores them in the database.

2. **Login**: Users authenticate via NextAuth credentials provider:
   - Email/password validation against database
   - Password verification using bcrypt comparison
   - JWT session creation on successful authentication

3. **Session Management**: JWT-based sessions for maintaining user state across requests.

4. **Protected Routes**: API endpoints check for valid sessions using `getServerSession(authOptions)`.

## Features

- User registration and authentication
- Create and view posts in a feed
- Comment on posts with nested replies
- Dark/light theme toggle
- Responsive design with Tailwind CSS
- Type-safe development with TypeScript

## Development

- `npm run dev`: Start development server with Turbopack
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## Deployment

The application can be deployed on Vercel or any platform supporting Next.js applications. Ensure environment variables are configured in your deployment platform.

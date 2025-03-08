# Music Agency Management System

A RESTful API built with Node.js and PostgreSQL for managing a music agency's artists, albums, tracks, and users.

## Features

- 🔐 User Authentication & Authorization
- 👥 Role-based Access Control (Admin, Editor, User)
- 🎵 Artist Management
- 💿 Album Management
- 🎧 Track Management
- ⭐ Favorites System
- 📝 CRUD Operations
- 📊 Pagination Support
- 🔍 Filtering Options
- 🛡️ Secure Password Handling

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt for password hashing

## API Endpoints

### Authentication
- `POST /api/signup` - Register a new user
- `POST /api/login` - User login
- `POST /api/logout` - User logout

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

### Artists
- `GET /api/artists` - Get all artists
- `GET /api/artists/:id` - Get artist by ID
- `POST /api/artists` - Add new artist (Admin/Editor)
- `PUT /api/artists/:id` - Update artist (Admin/Editor)
- `DELETE /api/artists/:id` - Delete artist (Admin/Editor)

### Albums
- `GET /api/albums` - Get all albums
- `GET /api/albums/:id` - Get album by ID
- `POST /api/albums` - Add new album (Admin/Editor)
- `PUT /api/albums/:id` - Update album (Admin/Editor)
- `DELETE /api/albums/:id` - Delete album (Admin/Editor)

### Tracks
- `GET /api/tracks` - Get all tracks
- `GET /api/tracks/:id` - Get track by ID
- `POST /api/tracks` - Add new track (Admin/Editor)
- `PUT /api/tracks/:id` - Update track (Admin/Editor)
- `DELETE /api/tracks/:id` - Delete track (Admin/Editor)

### Favorites
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:id` - Remove from favorites


## Setup and Installation

1. Clone the repository
```bash
git clone <repository-url>
cd music-agency-management
```

2. Install dependencies
```bash
npm install
```

3. Create a .env file in the root directory with the following variables:
```env
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret
```

4. Start the server
```bash
npm start
```

## Project Structure

```
├── auth/           # Authentication middleware
├── controllers/    # Business logic
├── models/        # Database models
├── routes/        # API routes
├── utils/         # Utility functions
├── dbconnection.js # Database configuration
└── index.js      # Application entry point
```

## Role-Based Access

- **Admin (role=1)**: Full access to all operations
- **Editor (role=2)**: Can manage artists, albums, and tracks
- **User (role=3)**: Can view public content and manage favorites

## Security Features

- JWT for authentication
- Password hashing
- Parameterized queries to prevent SQL injection
- Role-based access control
- SSL enabled database connection
- Request validation


## Acknowledgments

- Express.js for the web framework
- Supabase for PostgreSQL hosting
- JWT for authentication
- bcrypt for password hashing 
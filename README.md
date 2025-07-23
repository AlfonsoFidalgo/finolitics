# Finolitics

A Next.js web application for tracking and analyzing Disqus users from the finofilipino.org forum, a Spanish community with over 5 million monthly visitors. Discover, rate, and explore the most active "finoliers" (forum users) and their best posts.

## 🚀 Features

- **User Discovery**: Search for Disqus users by their username and view detailed profiles
- **Post Analysis**: Browse the greatest hits and most recent highlighted posts from users
- **User Rating System**: Vote on users with "like", "dislike", or "unknown" options
- **Activity Tracking**: View the most active users from the last 7 days
- **Statistics Dashboard**: See comprehensive stats including follower counts, reputation, and upvotes
- **Responsive Design**: Fully responsive UI built with Tailwind CSS

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **External API**: Disqus API for fetching user data and posts
- **Charts**: Recharts for data visualization
- **Testing**: Vitest with React Testing Library
- **Deployment**: Vercel

## 📊 Database Schema

The application tracks:
- **Finoliers**: User profiles with stats and metadata
- **Posts**: Individual forum posts with like/dislike counts and popularity scores
- **Threads**: Discussion threads from the forum
- **Votes**: User ratings and feedback
- **Users**: Application users for the voting system

## 🔧 Environment Variables

Create a `.env` file with:

```bash
DATABASE_URL="your_postgresql_connection_string"
DISQUS_API="your_disqus_api_key"
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finoliers
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── actions/           # Server actions for data fetching and mutations
├── app/              # Next.js app router pages and API routes
├── components/       # React components
├── contexts/         # React context providers
├── db/              # Database configuration
└── hooks/           # Custom React hooks

prisma/
├── schema.prisma    # Database schema
└── migrations/      # Database migrations
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Generate coverage report:

```bash
npm run coverage
```

## 📈 Key Features Explained

### User Search & Profiles
- Search for users by their Disqus username
- Automatic profile data synchronization from Disqus API
- Display user stats, avatar, bio, and location

### Post Tracking
- Automatically fetch and store user posts from Disqus
- Track post popularity based on likes and engagement
- Show greatest hits and recent highlights

### Community Features
- Rate users with a simple voting system
- View community-driven rankings
- Explore most active users and trending content

### Data Management
- Intelligent caching to minimize API calls
- Background job for periodic data updates
- Graceful handling of private profiles

## 🔄 API Integration

The app integrates with the Disqus API to:
- Fetch user profile information
- Retrieve user posts and comments
- Get thread and discussion data
- Sync data periodically via cron jobs

## 🚀 Deployment

The application is designed for deployment on Vercel:

```bash
npm run build
```

Make sure to configure environment variables in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is for educational and community purposes.

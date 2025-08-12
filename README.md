# 🎯 Application Tracker

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.0-purple?style=for-the-badge&logo=next.js&logoColor=white)](https://next-auth.js.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)

> A gamified job application tracking platform that makes the job search process engaging and productive through AI-powered tools and Pokémon collection mechanics.

## ✨ Features

### 🎮 Gamification

- **Pokémon Collection**: Catch Pokémon as you progress through your job search journey
- **Interactive Experience**: Turn the often stressful job application process into an engaging game
- **Progress Tracking**: Visual representation of your job search milestones

### 🤖 AI-Powered Tools

- **Resume Generation**: AI-customized resumes tailored to specific job applications
- **Cover Letter Creation**: Personalized cover letters generated using OpenAI's GPT models
- **Application Optimization**: Smart suggestions to improve your job applications

### 📊 Application Management

- **Centralized Dashboard**: Track all your job applications in one organized location
- **Status Tracking**: Monitor application progress (saved, applied, interviewed, offered, rejected)
- **Analytics**: Detailed statistics and insights into your job search performance
- **CSV Import**: Bulk import existing job applications from spreadsheets

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ejparnell/application-tracker.git
   cd application-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env.local` file in the root directory:

   ```env
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-here
   
   # OpenAI API Key (for AI features)
   OPENAI_API_KEY=your-openai-api-key-here
   
   # Database Configuration (if using external database)
   DATABASE_URL=your-database-url-here
   
   # OAuth Providers (Optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   
   # Email Provider (Optional)
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=your-email@example.com
   EMAIL_SERVER_PASSWORD=your-email-password
   EMAIL_FROM=noreply@yourapp.com
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 User Stories

### 🔐 Authentication

- Create an account to save job applications and Pokémon collection
- Secure login/logout functionality to protect user data
- Multiple authentication providers (email/password, OAuth)

### 📋 Application Tracking

- View all job applications in one centralized dashboard
- Generate personalized resumes and cover letters for each application
- Track application status throughout the hiring process
- Import existing applications from CSV files

### 🎮 Pokémon Collection

- Catch Pokémon as you progress through your job search
- View and manage your collected Pokémon
- Filter Pokémon by type, rarity, and other attributes

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: CSS Modules
- **UI Components**: Custom component library
- **State Management**: React Context + Custom Hooks

### Backend

- **API Routes**: Next.js API Routes
- **Authentication**: NextAuth.js
- **AI Integration**: OpenAI API
- **Data Storage**: Local JSON files (easily extensible to databases)

### External APIs

- **OpenAI GPT**: Resume and cover letter generation
- **PokéAPI**: Pokémon data and images

## 🏗️ Project Structure

```bash
src/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── applications/      # Job application management
│   ├── pokemon/           # Pokémon collection
│   └── api/              # API routes
├── components/           # Reusable React components
│   ├── auth/            # Authentication components
│   ├── applications/    # Application-related components
│   ├── pokemon/         # Pokémon-related components
│   └── ui/              # Generic UI components
├── hooks/               # Custom React hooks
├── context/             # React Context providers
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
└── lib/                 # External service configurations
```

## 🔧 API Overview

### Core Endpoints

#### Authentication

- `POST /api/auth/signin` - User authentication
- `GET /api/auth/session` - Get current session

#### Applications

- `GET /api/applications` - List all applications
- `POST /api/applications` - Create new application
- `POST /api/applications/:id/generate-resume` - AI resume generation

#### Pokémon

- `GET /api/pokemon` - Get available Pokémon
- `POST /api/pokemon/catch` - Catch a Pokémon
- `GET /api/user/pokemon` - User's collection

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**

2. **Add environment variables**

   ```env
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-production-secret
   OPENAI_API_KEY=your-openai-api-key
   ```

3. **Deploy**

   ```bash
   vercel --prod
   ```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write tests for new features
- Update documentation as needed

## 📊 Performance

- **Next.js 15** with App Router for optimal performance
- **Image Optimization** with Next.js Image component
- **Code Splitting** for faster initial page loads
- **Static Site Generation** where applicable

## 🔒 Security

- **NextAuth.js** for secure authentication
- **CSRF Protection** built-in
- **Environment Variables** for sensitive data
- **Type Safety** with TypeScript

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework used
- [OpenAI](https://openai.com/) - AI-powered features
- [PokéAPI](https://pokeapi.co/) - Pokémon data and images
- [NextAuth.js](https://next-auth.js.org/) - Authentication solution

## 📞 Support

If you have any questions or need help, please:

- Open an [issue](https://github.com/ejparnell/application-tracker/issues)
- Check the [documentation](https://github.com/ejparnell/application-tracker/wiki)
- Contact the maintainer: [@ejparnell](https://github.com/ejparnell)

---

**Made with ❤️ by [ejparnell](https://github.com/ejparnell)**

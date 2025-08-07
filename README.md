# Application Tracker

This application is designed to make the job application process easier by displaying a list of job applications from various sources. It connects to ChatGPT to provide a customized resume and cover letter for each job application. To keep the user engaged, it also includes a game of collecting Pokemon. As the user applies, interviews, and gets rejected, they can catch Pokemon to keep the experience fun and interactive.

The user will have to provide their own csv of job applications to import into the app and their own OpenAI API key to enable the AI features.

## User Stories

Authentication:

- As a user, I want to create an account to save my job applications and Pokemon collection.
- As a user, I want to log in to my account to access my saved job applications and Pokemon collection.
- As a user, I want to log out of my account to secure my information.

Application tracker:

- As a user, I want to view a list of my job applications in one place.
- As a user, I want to receive personalized resume and cover letter suggestions for each job application.
- As a user, I want to track the status of my job applications (e.g., applied, interviewed, rejected).

Pokemon collection:

- As a user, I want to catch Pokemon while I apply for jobs.
- As a user, I want to view the Pokemon I have caught.
- As a user, I want to filter Pokemon by type or rarity.

## Models Entities and Validations

### Entity Relationship Diagram (ERD)

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│      User       │         │   Application   │         │     Pokemon     │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ id (PK)         │────────○│ userId (FK)     │         │ id (PK)         │
│ email           │         │ id (PK)         │         │ name            │
│ password        │         │ title           │         │ type            │
│ firstName       │         │ company         │         │ rarity          │
│ lastName        │         │ location        │         │ imageUrl        │
│ profilePicture  │         │ jobUrl          │         │ description     │
│ createdAt       │         │ salary          │         │ abilities       │
│ updatedAt       │         │ status          │         │ stats           │
└─────────────────┘         │ notes           │         │ createdAt       │
                            │ resumeContent   │         │ updatedAt       │
                            │ coverLetter     │         └─────────────────┘
                            │ appliedAt       │                   │
                            │ createdAt       │         ┌─────────────────┐
                            │ updatedAt       │         │ UserPokemon     │
                            └─────────────────┘         ├─────────────────┤
                                                        │ id (PK)         │
                                                        │ userId (FK)     │
                                                        │ pokemonId (FK)  │
                                                        │ nickname        │  
                                                        │ level           │  
                                                        │ caughtAt        │  
                                                        │ createdAt       │  
                                                        │ updatedAt       │  
                                                        └─────────────────┘  
                                                                             
Relationships:                                                               
- User has many Applications (1:N)                                         
- User has many UserPokemon (1:N)                                          
- Pokemon has many UserPokemon (1:N)                                       
- UserPokemon belongs to User and Pokemon (N:1)                           
```

### User Model

**Properties:**

- `id`: UUID (Primary Key)
- `email`: String (Unique, Required, Email format)
- `password`: String (Required, Min 8 characters, Hashed)
- `firstName`: String (Required, Max 50 characters)
- `lastName`: String (Required, Max 50 characters)
- `profilePicture`: String (Optional, URL)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Validations:**

- Email must be unique and valid email format
- Password must be at least 8 characters with at least one uppercase, lowercase, number, and special character
- First and last names are required and cannot be empty
- Profile picture must be a valid URL if provided

### Application Model

**Properties:**

- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key to User)
- `title`: String (Required, Max 200 characters)
- `company`: String (Required, Max 100 characters)
- `location`: String (Optional, Max 100 characters)
- `jobUrl`: String (Optional, URL)
- `salary`: String (Optional, Max 50 characters)
- `status`: Enum (Required, Values: 'saved', 'applied', 'interviewed', 'offered', 'rejected')
- `notes`: Text (Optional)
- `resumeContent`: Text (Optional, Generated by AI)
- `coverLetter`: Text (Optional, Generated by AI)
- `appliedAt`: DateTime (Optional)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Validations:**

- Title and company are required
- Status must be one of the predefined enum values
- Job URL must be valid URL format if provided
- Applied date cannot be in the future

### Pokemon Model

**Properties:**

- `id`: UUID (Primary Key)
- `name`: String (Required, Unique, Max 50 characters)
- `type`: String[] (Required, Pokemon types like 'fire', 'water', 'grass')
- `rarity`: Enum (Required, Values: 'common', 'uncommon', 'rare', 'epic', 'legendary')
- `imageUrl`: String (Required, URL)
- `description`: Text (Optional)
- `abilities`: String[] (Optional)
- `stats`: JSON (Optional, Contains HP, Attack, Defense, etc.)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Validations:**

- Name must be unique and required
- Type must be from predefined Pokemon type list
- Rarity must be one of the enum values
- Image URL must be valid and required

### UserPokemon Model (Junction Table)

**Properties:**

- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key to User)
- `pokemonId`: UUID (Foreign Key to Pokemon)
- `nickname`: String (Optional, Max 50 characters)
- `level`: Integer (Default: 1, Min: 1, Max: 100)
- `caughtAt`: DateTime (Required)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Validations:**

- User and Pokemon IDs must reference valid entities
- Level must be between 1 and 100
- Caught date cannot be in the future
- Unique constraint on userId + pokemonId (user can't catch same Pokemon twice)

## API Endpoints

### Authentication Routes (NextAuth)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handlers (signin, signout, callback, etc.) | Varies | NextAuth responses |
| GET | `/api/auth/session` | Get current session | - | `{ user, expires }` |
| GET | `/api/auth/csrf` | Get CSRF token | - | `{ csrfToken }` |
| GET | `/api/auth/providers` | Get configured providers | - | `{ providers }` |
| POST | `/api/auth/signin` | Sign in with credentials/providers | `{ email, password }` or provider data | Redirect or session |
| POST | `/api/auth/signout` | Sign out user | `{ csrfToken }` | Redirect |
| POST | `/api/auth/callback/credentials` | Credentials callback | `{ email, password }` | Session or error |

### User Management Routes

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/users/register` | Create new user account | `{ email, password, firstName, lastName }` | `{ user }` |
| GET | `/api/users/profile` | Get user profile | - | `{ user }` |
| PUT | `/api/users/profile` | Update user profile | `{ firstName, lastName, profilePicture }` | `{ user }` |
| DELETE | `/api/users/account` | Delete user account | - | `{ message }` |

### Application Routes

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/applications` | Get all user applications | - | `{ applications }` |
| GET | `/api/applications/:id` | Get specific application | - | `{ application }` |
| POST | `/api/applications` | Create new application | `{ title, company, location, jobUrl, salary }` | `{ application }` |
| PUT | `/api/applications/:id` | Update application | `{ title, company, location, jobUrl, salary, status, notes }` | `{ application }` |
| DELETE | `/api/applications/:id` | Delete application | - | `{ message }` |
| POST | `/api/applications/:id/generate-resume` | Generate AI resume | `{ jobDescription }` | `{ resumeContent }` |
| POST | `/api/applications/:id/generate-cover-letter` | Generate AI cover letter | `{ jobDescription }` | `{ coverLetter }` |
| PUT | `/api/applications/:id/status` | Update application status | `{ status }` | `{ application }` |

### Pokemon Routes

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/pokemon` | Get all available Pokemon | - | `{ pokemon }` |
| GET | `/api/pokemon/:id` | Get specific Pokemon details | - | `{ pokemon }` |
| GET | `/api/pokemon/random` | Get random Pokemon for catching | - | `{ pokemon }` |
| POST | `/api/pokemon/catch` | Catch a Pokemon | `{ pokemonId, nickname? }` | `{ userPokemon }` |

### User Pokemon Routes

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/user/pokemon` | Get user's Pokemon collection | `?type=&rarity=&sort=` | `{ userPokemon }` |
| GET | `/api/user/pokemon/:id` | Get specific user Pokemon | - | `{ userPokemon }` |
| PUT | `/api/user/pokemon/:id` | Update Pokemon nickname | `{ nickname }` | `{ userPokemon }` |
| DELETE | `/api/user/pokemon/:id` | Release Pokemon | - | `{ message }` |
| POST | `/api/user/pokemon/:id/level-up` | Level up Pokemon | - | `{ userPokemon }` |

### Statistics Routes

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/stats/applications` | Get application statistics | - | `{ totalApplications, byStatus, monthlyTrend }` |
| GET | `/api/stats/pokemon` | Get Pokemon collection stats | - | `{ totalCaught, byType, byRarity }` |

## Frontend Routes

### Public Routes (No Authentication Required)

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `HomePage` | Landing page with app overview and sign-up prompt |
| `/signin` | `SignInPage` | NextAuth sign-in page with multiple providers |
| `/signup` | `SignUpPage` | Custom user registration page |
| `/auth/error` | `AuthErrorPage` | NextAuth error handling page |

### Protected Routes (Authentication Required)

| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard` | `DashboardPage` | Main dashboard with overview of applications and Pokemon |
| `/applications` | `ApplicationsPage` | List view of all job applications |
| `/applications/new` | `NewApplicationPage` | Form to add new job application |
| `/applications/:id` | `ApplicationDetailPage` | Detailed view of specific application |
| `/applications/:id/edit` | `EditApplicationPage` | Form to edit existing application |
| `/pokemon` | `PokemonCollectionPage` | User's Pokemon collection with filtering |
| `/pokemon/catch` | `CatchPokemonPage` | Pokemon catching game interface |
| `/pokemon/:id` | `PokemonDetailPage` | Detailed view of specific Pokemon |
| `/profile` | `ProfilePage` | User profile settings and information |
| `/stats` | `StatsPage` | Analytics dashboard for applications and Pokemon |

### NextAuth Routes (Handled by NextAuth)

| Route | Description |
|-------|-------------|
| `/api/auth/signin` | Sign-in page with configured providers |
| `/api/auth/signout` | Sign-out confirmation and processing |
| `/api/auth/callback/*` | OAuth provider callbacks |
| `/api/auth/csrf` | CSRF token endpoint |
| `/api/auth/session` | Session data endpoint |
| `/api/auth/providers` | Available auth providers |

### Route Parameters and Query Strings

**Application Routes:**

- `/applications?status=applied&sort=date` - Filter applications by status and sort
- `/applications/:id` - Application ID parameter

**Pokemon Routes:**

- `/pokemon?type=fire&rarity=rare&sort=level` - Filter Pokemon by type, rarity, and sort
- `/pokemon/:id` - Pokemon ID parameter

### Route Guards and Middleware

**NextAuth Middleware:** Protects routes using NextAuth session validation in `middleware.ts`
- Automatically redirects unauthenticated users to `/signin`
- Protects all routes under `/dashboard`, `/applications`, `/pokemon`, `/profile`, and `/stats`
- Handles session refresh and token validation

**Auth Configuration:**
- **Providers**: Email/Password, Google OAuth, GitHub OAuth (configurable)
- **Session Strategy**: JWT tokens with secure httpOnly cookies
- **CSRF Protection**: Built-in CSRF token validation
- **Callbacks**: Custom session and JWT callbacks for user data

## Component Structure

### Next.js v15 App Router Structure

```
src/
├── app/                            # Next.js v15 App Router
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout component with SessionProvider
│   ├── page.tsx                    # Home page
│   ├── loading.tsx                 # Global loading UI
│   ├── error.tsx                   # Global error UI
│   ├── not-found.tsx               # 404 page
│   │
│   ├── (auth)/                     # Route group for auth pages
│   │   ├── signin/
│   │   │   └── page.tsx            # NextAuth sign-in page
│   │   ├── signup/
│   │   │   └── page.tsx            # Custom sign-up page
│   │   ├── signout/
│   │   │   └── page.tsx            # NextAuth sign-out confirmation
│   │   └── error/
│   │       └── page.tsx            # NextAuth error page
│   │
│   ├── dashboard/
│   │   ├── page.tsx                # Dashboard page
│   │   ├── loading.tsx             # Dashboard loading UI
│   │   └── layout.tsx              # Dashboard layout
│   │
│   ├── applications/
│   │   ├── page.tsx                # Applications list page
│   │   ├── loading.tsx             # Applications loading UI
│   │   ├── new/
│   │   │   └── page.tsx            # New application page
│   │   └── [id]/
│   │       ├── page.tsx            # Application detail page
│   │       └── edit/
│   │           └── page.tsx        # Edit application page
│   │
│   ├── pokemon/
│   │   ├── page.tsx                # Pokemon collection page
│   │   ├── loading.tsx             # Pokemon loading UI
│   │   ├── catch/
│   │   │   └── page.tsx            # Pokemon catching page
│   │   └── [id]/
│   │       └── page.tsx            # Pokemon detail page
│   │
│   ├── profile/
│   │   └── page.tsx                # User profile page
│   │
│   ├── stats/
│   │   └── page.tsx                # Statistics page
│   │
│   └── api/                        # API routes
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts        # NextAuth configuration and handlers
│       ├── applications/
│       │   ├── route.ts            # GET, POST /api/applications
│       │   └── [id]/
│       │       ├── route.ts        # GET, PUT, DELETE /api/applications/:id
│       │       ├── generate-resume/
│       │       │   └── route.ts    # POST /api/applications/:id/generate-resume
│       │       ├── generate-cover-letter/
│       │       │   └── route.ts    # POST /api/applications/:id/generate-cover-letter
│       │       └── status/
│       │           └── route.ts    # PUT /api/applications/:id/status
│       ├── pokemon/
│       │   ├── route.ts            # GET /api/pokemon
│       │   ├── random/
│       │   │   └── route.ts        # GET /api/pokemon/random
│       │   ├── catch/
│       │   │   └── route.ts        # POST /api/pokemon/catch
│       │   └── [id]/
│       │       └── route.ts        # GET /api/pokemon/:id
│       ├── user/
│       │   └── pokemon/
│       │       ├── route.ts        # GET /api/user/pokemon
│       │       └── [id]/
│       │           ├── route.ts    # GET, PUT, DELETE /api/user/pokemon/:id
│       │           └── level-up/
│       │               └── route.ts # POST /api/user/pokemon/:id/level-up
│       └── stats/
│           ├── applications/
│           │   └── route.ts        # GET /api/stats/applications
│           └── pokemon/
│               └── route.ts        # GET /api/stats/pokemon
│
├── components/
│   ├── layout/
│   │   ├── Header/
│   │   │   ├── index.tsx           # Main navigation header
│   │   │   ├── Header.module.css   # Header styles
│   │   │   └── Header.test.tsx     # Header tests
│   │   ├── Sidebar/
│   │   │   ├── index.tsx           # Sidebar navigation for dashboard
│   │   │   ├── Sidebar.module.css  # Sidebar styles
│   │   │   └── Sidebar.test.tsx    # Sidebar tests
│   │   ├── Footer/
│   │   │   ├── index.tsx           # App footer
│   │   │   ├── Footer.module.css   # Footer styles
│   │   │   └── Footer.test.tsx     # Footer tests
│   │   └── Layout/
│   │       ├── index.tsx           # Main layout wrapper
│   │       ├── Layout.module.css   # Layout styles
│   │       └── Layout.test.tsx     # Layout tests
│   │
│   ├── auth/
│   │   ├── SignInForm/
│   │   │   ├── index.tsx           # NextAuth sign-in form component
│   │   │   ├── SignInForm.module.css # Sign-in form styles
│   │   │   └── SignInForm.test.tsx # Sign-in form tests
│   │   ├── SignUpForm/
│   │   │   ├── index.tsx           # Custom sign-up form component
│   │   │   ├── SignUpForm.module.css # Sign-up form styles
│   │   │   └── SignUpForm.test.tsx # Sign-up form tests
│   │   ├── AuthGuard/
│   │   │   ├── index.tsx           # Route protection component with NextAuth
│   │   │   └── AuthGuard.test.tsx  # Auth guard tests
│   │   ├── SessionProvider/
│   │   │   ├── index.tsx           # NextAuth session provider wrapper
│   │   │   └── SessionProvider.test.tsx # Session provider tests
│   │   ├── SignOutButton/
│   │   │   ├── index.tsx           # NextAuth sign-out button
│   │   │   ├── SignOutButton.module.css # Sign-out button styles
│   │   │   └── SignOutButton.test.tsx # Sign-out button tests
│   │   └── UserProfile/
│   │       ├── index.tsx           # User profile display component
│   │       ├── UserProfile.module.css # Profile styles
│   │       └── UserProfile.test.tsx # Profile tests
│   │
│   ├── applications/
│   │   ├── ApplicationCard/
│   │   │   ├── index.tsx           # Individual application card
│   │   │   ├── ApplicationCard.module.css # Card styles
│   │   │   └── ApplicationCard.test.tsx # Card tests
│   │   ├── ApplicationList/
│   │   │   ├── index.tsx           # List of application cards
│   │   │   ├── ApplicationList.module.css # List styles
│   │   │   └── ApplicationList.test.tsx # List tests
│   │   ├── ApplicationForm/
│   │   │   ├── index.tsx           # Form for creating/editing applications
│   │   │   ├── ApplicationForm.module.css # Form styles
│   │   │   └── ApplicationForm.test.tsx # Form tests
│   │   ├── ApplicationDetail/
│   │   │   ├── index.tsx           # Detailed application view
│   │   │   ├── ApplicationDetail.module.css # Detail styles
│   │   │   └── ApplicationDetail.test.tsx # Detail tests
│   │   ├── StatusBadge/
│   │   │   ├── index.tsx           # Application status indicator
│   │   │   ├── StatusBadge.module.css # Badge styles
│   │   │   └── StatusBadge.test.tsx # Badge tests
│   │   ├── ApplicationFilters/
│   │   │   ├── index.tsx           # Filter and sort controls
│   │   │   ├── ApplicationFilters.module.css # Filters styles
│   │   │   └── ApplicationFilters.test.tsx # Filters tests
│   │   ├── ResumeGenerator/
│   │   │   ├── index.tsx           # AI resume generation component
│   │   │   ├── ResumeGenerator.module.css # Generator styles
│   │   │   └── ResumeGenerator.test.tsx # Generator tests
│   │   └── CoverLetterGenerator/
│   │       ├── index.tsx           # AI cover letter generation component
│   │       ├── CoverLetterGenerator.module.css # Generator styles
│   │       └── CoverLetterGenerator.test.tsx # Generator tests
│   │
│   ├── pokemon/
│   │   ├── PokemonCard/
│   │   │   ├── index.tsx           # Individual Pokemon card
│   │   │   ├── PokemonCard.module.css # Card styles
│   │   │   └── PokemonCard.test.tsx # Card tests
│   │   ├── PokemonGrid/
│   │   │   ├── index.tsx           # Grid layout for Pokemon collection
│   │   │   ├── PokemonGrid.module.css # Grid styles
│   │   │   └── PokemonGrid.test.tsx # Grid tests
│   │   ├── PokemonDetail/
│   │   │   ├── index.tsx           # Detailed Pokemon view
│   │   │   ├── PokemonDetail.module.css # Detail styles
│   │   │   └── PokemonDetail.test.tsx # Detail tests
│   │   ├── CatchPokemon/
│   │   │   ├── index.tsx           # Pokemon catching game component
│   │   │   ├── CatchPokemon.module.css # Game styles
│   │   │   └── CatchPokemon.test.tsx # Game tests
│   │   ├── PokemonFilters/
│   │   │   ├── index.tsx           # Filter Pokemon by type/rarity
│   │   │   ├── PokemonFilters.module.css # Filters styles
│   │   │   └── PokemonFilters.test.tsx # Filters tests
│   │   ├── PokemonStats/
│   │   │   ├── index.tsx           # Pokemon statistics display
│   │   │   ├── PokemonStats.module.css # Stats styles
│   │   │   └── PokemonStats.test.tsx # Stats tests
│   │   └── TypeBadge/
│   │       ├── index.tsx           # Pokemon type indicator
│   │       ├── TypeBadge.module.css # Badge styles
│   │       └── TypeBadge.test.tsx  # Badge tests
│   │
│   ├── dashboard/
│   │   ├── DashboardStats/
│   │   │   ├── index.tsx           # Overview statistics
│   │   │   ├── DashboardStats.module.css # Stats styles
│   │   │   └── DashboardStats.test.tsx # Stats tests
│   │   ├── RecentApplications/
│   │   │   ├── index.tsx           # Recent applications widget
│   │   │   ├── RecentApplications.module.css # Widget styles
│   │   │   └── RecentApplications.test.tsx # Widget tests
│   │   ├── PokemonSummary/
│   │   │   ├── index.tsx           # Pokemon collection summary
│   │   │   ├── PokemonSummary.module.css # Summary styles
│   │   │   └── PokemonSummary.test.tsx # Summary tests
│   │   └── QuickActions/
│   │       ├── index.tsx           # Quick action buttons
│   │       ├── QuickActions.module.css # Actions styles
│   │       └── QuickActions.test.tsx # Actions tests
│   │
│   ├── ui/
│   │   ├── Button/
│   │   │   ├── index.tsx           # Reusable button component
│   │   │   ├── Button.module.css   # Button styles
│   │   │   └── Button.test.tsx     # Button tests
│   │   ├── Input/
│   │   │   ├── index.tsx           # Form input component
│   │   │   ├── Input.module.css    # Input styles
│   │   │   └── Input.test.tsx      # Input tests
│   │   ├── Select/
│   │   │   ├── index.tsx           # Dropdown select component
│   │   │   ├── Select.module.css   # Select styles
│   │   │   └── Select.test.tsx     # Select tests
│   │   ├── Modal/
│   │   │   ├── index.tsx           # Modal dialog component
│   │   │   ├── Modal.module.css    # Modal styles
│   │   │   └── Modal.test.tsx      # Modal tests
│   │   ├── Loading/
│   │   │   ├── index.tsx           # Loading spinner component
│   │   │   ├── Loading.module.css  # Loading styles
│   │   │   └── Loading.test.tsx    # Loading tests
│   │   ├── ErrorBoundary/
│   │   │   ├── index.tsx           # Error handling component
│   │   │   ├── ErrorBoundary.module.css # Error styles
│   │   │   └── ErrorBoundary.test.tsx # Error tests
│   │   ├── Toast/
│   │   │   ├── index.tsx           # Notification toast component
│   │   │   ├── Toast.module.css    # Toast styles
│   │   │   └── Toast.test.tsx      # Toast tests
│   │   └── ConfirmDialog/
│   │       ├── index.tsx           # Confirmation dialog
│   │       ├── ConfirmDialog.module.css # Dialog styles
│   │       └── ConfirmDialog.test.tsx # Dialog tests
│   │
│   └── charts/
│       ├── ApplicationChart/
│       │   ├── index.tsx           # Application status chart
│       │   ├── ApplicationChart.module.css # Chart styles
│       │   └── ApplicationChart.test.tsx # Chart tests
│       ├── PokemonChart/
│       │   ├── index.tsx           # Pokemon collection chart
│       │   ├── PokemonChart.module.css # Chart styles
│       │   └── PokemonChart.test.tsx # Chart tests
│       └── TrendChart/
│           ├── index.tsx           # Time-based trend chart
│           ├── TrendChart.module.css # Chart styles
│           └── TrendChart.test.tsx # Chart tests
│
├── hooks/
│   ├── useAuth.ts                  # Authentication state management
│   ├── useApplications.ts          # Applications data management
│   ├── usePokemon.ts               # Pokemon data management
│   ├── useLocalStorage.ts          # Local storage utilities
│   └── useApi.ts                   # API request management
│
├── context/
│   ├── AuthContext.tsx             # Authentication context
│   ├── ApplicationContext.tsx      # Applications context
│   └── PokemonContext.tsx          # Pokemon context
│
├── utils/
│   ├── api.ts                      # API client configuration
│   ├── auth.ts                     # Authentication utilities
│   ├── validation.ts               # Form validation schemas
│   ├── constants.ts                # App constants
│   └── helpers.ts                  # General utility functions
│
├── types/
│   ├── auth.ts                     # Authentication types
│   ├── application.ts              # Application types
│   ├── pokemon.ts                  # Pokemon types
│   └── api.ts                      # API response types
│
├── lib/
│   ├── auth.ts                     # NextAuth configuration and options
│   ├── database.ts                 # Database connection and models
│   ├── openai.ts                   # OpenAI API configuration
│   └── pokemon-data.ts             # Pokemon seed data
│
├── auth.ts                         # NextAuth configuration file (root level)
└── middleware.ts                   # Next.js middleware for auth and route protection
```

### Component Design Principles

**Reusability:** UI components are designed to be reusable across different parts of the application

**Separation of Concerns:** Each component has a single responsibility and clear interface

**State Management:** Uses React Context for global state and custom hooks for component-level state

**Type Safety:** All components are fully typed with TypeScript interfaces

**Responsive Design:** Components are built mobile-first with responsive breakpoints

**Accessibility:** Components follow WCAG guidelines with proper ARIA labels and keyboard navigation

## NextAuth Configuration

### Environment Variables Required

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Database
DATABASE_URL=your-database-connection-string

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email Provider (Optional)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com

# OpenAI API (for resume/cover letter generation)
OPENAI_API_KEY=your-openai-api-key
```

### NextAuth Providers Configuration

**Credentials Provider**: Custom email/password authentication with database validation
**Google OAuth**: Sign in with Google accounts
**GitHub OAuth**: Sign in with GitHub accounts
**Email Provider**: Magic link authentication via email

### Session Management

**JWT Strategy**: Stateless authentication using JSON Web Tokens
**Session Duration**: 30 days with automatic refresh
**Secure Cookies**: httpOnly, secure, and sameSite protection
**CSRF Protection**: Built-in token validation for all authentication requests

### Database Adapter

Uses database adapter to store user accounts, sessions, and verification tokens in your preferred database (PostgreSQL, MySQL, or MongoDB compatible).
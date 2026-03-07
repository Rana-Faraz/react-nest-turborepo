<h1 align="center">
  <span style="font-size: 3em;">NinjaNotes</span>
</h1>

<p align="center">
  <strong>AI-powered note-taking and productivity application built with NestJS and React.</strong>
</p>

<!-- > **💡 Tip**: If viewing this README in your code editor, press `Ctrl + Shift + V` (Windows/Linux) or `Cmd + Shift + V` (macOS) to open the markdown preview. -->

---

## Quick Navigation

- [Overview](#overview)
- [System Requirements](#system-requirements)
- [Installation](#installation)
  - [macOS](#installation---macos)
  - [Linux](#installation---linux)
  - [Windows](#installation---windows)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
---

<div style="border-left: 5px solid #4CAF50; padding-left: 15px; margin: 20px 0; background: linear-gradient(90deg, rgba(76, 175, 80, 0.1) 0%, transparent 100%);">

## Overview

</div>

NinjaNotes is a comprehensive AI-powered note-taking and productivity application designed to transform how teams capture, organize, and collaborate on information. Built with modern technologies and enterprise-grade infrastructure, it seamlessly integrates with your workflow to enhance productivity and streamline meeting management.

The application enables users to capture information through multiple channels, including voice and video recordings with real-time transcription capabilities. Leveraging advanced AI technology, NinjaNotes automatically generates summaries, extracts action items, and provides intelligent insights from your meetings and notes, saving valuable time and ensuring nothing important is missed.

With robust calendar integration and event tracking, NinjaNotes serves as your central hub for meeting management. Whether you're conducting team meetings, client calls, or brainstorming sessions, the platform keeps everything organized and accessible. The collaborative features allow teams to share notes, assign action items, and work together efficiently, while secure file storage powered by MinIO/S3 integration ensures your data remains safe and readily available.

NinjaNotes is built on a scalable architecture using NestJS and React, designed to handle enterprise-level workloads while maintaining performance and reliability. The application provides a modern, intuitive interface that makes complex features accessible to users of all technical backgrounds.

### Tech Stack

- **Backend**: NestJS, TypeORM, PostgreSQL
- **Frontend**: React, Vite, TypeScript
- **Infrastructure**: Docker, Redis, LiveKit, MinIO
- **Monorepo**: Turborepo with pnpm

---

<div style="border-left: 5px solid #2196F3; padding-left: 15px; margin: 20px 0; background: linear-gradient(90deg, rgba(33, 150, 243, 0.1) 0%, transparent 100%);">

## System Requirements

</div>

### Minimum Requirements

- **RAM**: 16GB (recommended for optimal performance)
- **Node.js**: >= 18
- **PostgreSQL**: 16 or higher
- **Docker**: Latest version with Docker Compose
- **pnpm**: 9.0.0
- **Operating System**: Windows, Linux, or macOS

### Required Software Versions

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | >= 18 | Runtime environment |
| PostgreSQL | 16+ | Database |
| Docker | Latest | Containerization |
| Docker Compose | Latest | Multi-container orchestration |
| pnpm | 9.0.0 | Package manager |

---

<div style="border-left: 5px solid #FF9800; padding-left: 15px; margin: 20px 0; background: linear-gradient(90deg, rgba(255, 152, 0, 0.1) 0%, transparent 100%);">

## Installation

</div>

Choose your operating system:

- [macOS](#installation---macos)
- [Linux](#installation---linux)
- [Windows](#installation---windows)

---

<div style="border-left: 5px solid #FFB74D; padding-left: 15px; margin: 20px 0; background: linear-gradient(90deg, rgba(255, 183, 77, 0.1) 0%, transparent 100%);">

## Installation - macOS

</div>

### Prerequisites Check

#### 1. Verify Node.js Installation

**Check Node.js version**

```bash
node --version
```

**Expected output**: `v18.x.x` or higher

If not installed, download from [nodejs.org](https://nodejs.org/)

---

#### 2. Verify pnpm Installation

**Check pnpm version**

```bash
pnpm --version
```

**Expected output**: `9.0.0`

**Install pnpm globally** (if not installed)

```bash
npm install -g pnpm@9.0.0
```

---

#### 3. Verify Docker Installation

**Check Docker version**

```bash
docker --version
```

**Check Docker daemon status**

```bash
docker ps
```

**Expected**: Docker daemon should be running

If Docker is not installed, install [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)

---

#### 4. Verify PostgreSQL Installation

**Check PostgreSQL version**

```bash
psql --version
```

**Expected output**: `psql (PostgreSQL) 16` or higher

**Install PostgreSQL** (if not installed)

```bash
brew install postgresql@18
brew services start postgresql@18
```

**Verify PostgreSQL is running**

```bash
brew services list | grep postgresql
```

---

### Step-by-Step Installation

#### Step 1: Clone the Repository

**Clone using SSH**

```bash
git clone git@github.com:ninja-concepts/ninja-notes.git
cd ninja-notes
```

**Clone using HTTPS**

```bash
git clone https://github.com/ninja-concepts/ninja-notes.git
cd ninja-notes
```

**Note for new users**: If you're cloning using SSH, you'll need to configure Git with CLI authentication. You can use either:
- **SSH keys**: Set up SSH keys and add them to your GitHub/GitLab account
- **Access token**: Use a personal access token for HTTPS authentication

For detailed instructions on configuring Git authentication, refer to the [Git documentation](https://docs.github.com/en/authentication) or contact the development team.

---

#### Step 2: Setup PostgreSQL Database

**Connect to PostgreSQL**

```bash
psql postgres
```

**In PostgreSQL prompt, run:**

```sql
-- Create role
CREATE ROLE ninjanotes_user WITH LOGIN PASSWORD 'your_password';

-- Create database
CREATE DATABASE ninjanotes_db OWNER ninjanotes_user;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE ninjanotes_db TO ninjanotes_user;

-- Exit PostgreSQL
\q
```

**Verify database connection**

```bash
psql -U ninjanotes_user -d ninjanotes_db -h localhost
```

---

#### Step 3: Configure Environment Variables

**Create backend environment file**

```bash
cd apps/backend
touch .env
```

**Create frontend environment file**

```bash
cd apps/web
touch .env
```

**Configure environment variables** in both `.env` files:
- Database connection details (host, port, user, password, database name)
- API keys and secrets (Contact the development team)
- Service URLs and ports
- Third-party service credentials

---

#### Step 4: Start Docker Services

**Navigate to backend directory**

```bash
cd apps/backend
```

**Start Docker containers**

```bash
docker compose up -d
```

**Verify Docker containers are running**

```bash
docker ps
```

**Expected containers**:
- `minio` (ports 9000, 9090)
- `redis` (port 6379)
- `livekit` (ports 7880, 7881, 7882)
- `livekit-egress`

**Check container logs** (if needed)

```bash
docker compose logs
```

---

#### Step 5: Install Dependencies

**Navigate to project root**

```bash
cd ../..
```

**Install all dependencies**

```bash
pnpm install
```

---

#### Step 6: Run Database Migrations

**Run migrations**

```bash
pnpm migration:run
```

**Note**: Migration files already exist in the repository. Only run migrations during installation. Generate migrations only when creating new database schema changes.

---

#### Step 7: Build the Project

**Build all packages and apps**

```bash
pnpm run build
```

**Verify build success** - Check terminal output for any errors

---

#### Step 8: Setup Stripe CLI (Optional - for webhook testing)

**Install Stripe CLI**

```bash
brew install stripe/stripe-cli/stripe
```

**Create Stripe Account**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Create account with your **work email**
3. Set **Country** as **United States (US)**
4. Complete account verification

**Join Ninja Concepts Sandbox**

Contact the development team to receive an invite link to the **Ninja Concepts Stripe sandbox account**

**Login to Stripe CLI**

```bash
stripe login
```

This will:
- Open your browser for authentication
- Connect your Stripe account with the CLI
- Provide access to publishable key (pk) and secret key (sk)

**Forward webhooks to local backend**

```bash
stripe listen --forward-to localhost:3000/subscription/webhook
```

**Copy webhook signing secret** - Use this in your backend `.env` file

---

<div style="border-left: 5px solid #00BCD4; padding-left: 15px; margin: 20px 0; background: linear-gradient(90deg, rgba(0, 188, 212, 0.1) 0%, transparent 100%);">

## Installation - Linux

</div>

### Prerequisites Check

#### 1. Verify Node.js Installation

**Check Node.js version**

```bash
node --version
```

**Expected output**: `v18.x.x` or higher

If not installed, download from [nodejs.org](https://nodejs.org/)

---

#### 2. Verify pnpm Installation

**Check pnpm version**

```bash
pnpm --version
```

**Expected output**: `9.0.0`

**Install pnpm globally** (if not installed)

```bash
npm install -g pnpm@9.0.0
```

---

#### 3. Verify Docker Installation

**Check Docker version**

```bash
docker --version
```

**Check Docker daemon status**

```bash
docker ps
```

**Check Docker service status**

```bash
sudo systemctl status docker
```

**Expected**: Docker daemon should be running

If Docker is not installed, follow [Docker installation guide](https://docs.docker.com/engine/install/)

---

#### 4. Verify PostgreSQL Installation

**Check PostgreSQL version**

```bash
psql --version
```

**Expected output**: `psql (PostgreSQL) 16` or higher

**Install PostgreSQL** (if not installed)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql-18

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Verify PostgreSQL is running**

```bash
sudo systemctl status postgresql
```

---

### Step-by-Step Installation

#### Step 1: Clone the Repository

**Clone using SSH**

```bash
git clone git@github.com:ninja-concepts/ninja-notes.git
cd ninja-notes
```

**Clone using HTTPS**

```bash
git clone https://github.com/ninja-concepts/ninja-notes.git
cd ninja-notes
```

**Note for new users**: If you're cloning using SSH, you'll need to configure Git with CLI authentication. You can use either:
- **SSH keys**: Set up SSH keys and add them to your GitHub/GitLab account
- **Access token**: Use a personal access token for HTTPS authentication

For detailed instructions on configuring Git authentication, refer to the [Git documentation](https://docs.github.com/en/authentication) or contact the development team.

---

#### Step 2: Setup PostgreSQL Database

**Connect to PostgreSQL**

```bash
sudo -u postgres psql
```

**In PostgreSQL prompt, run:**

```sql
-- Create role
CREATE ROLE ninjanotes_user WITH LOGIN PASSWORD 'your_password';

-- Create database
CREATE DATABASE ninjanotes_db OWNER ninjanotes_user;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE ninjanotes_db TO ninjanotes_user;

-- Exit PostgreSQL
\q
```

**Verify database connection**

```bash
psql -U ninjanotes_user -d ninjanotes_db -h localhost
```

---

#### Step 3: Configure Environment Variables

**Create backend environment file**

```bash
cd apps/backend
touch .env
```

**Create frontend environment file**

```bash
cd apps/web
touch .env
```

**Configure environment variables** in both `.env` files:
- Database connection details (host, port, user, password, database name)
- API keys and secrets (Contact the development team)
- Service URLs and ports
- Third-party service credentials

---

#### Step 4: Start Docker Services

**Navigate to backend directory**

```bash
cd apps/backend
```

**Start Docker containers**

```bash
docker compose up -d
```

**Verify Docker containers are running**

```bash
docker ps
```

**Expected containers**:
- `minio` (ports 9000, 9090)
- `redis` (port 6379)
- `livekit` (ports 7880, 7881, 7882)
- `livekit-egress`

**Check container logs** (if needed)

```bash
docker compose logs
```

---

#### Step 5: Install Dependencies

**Navigate to project root**

```bash
cd ../..
```

**Install all dependencies**

```bash
pnpm install
```

---

#### Step 6: Run Database Migrations

**Run migrations**

```bash
pnpm migration:run
```

**Note**: Migration files already exist in the repository. Only run migrations during installation. Generate migrations only when creating new database schema changes.

---

#### Step 7: Build the Project

**Build all packages and apps**

```bash
pnpm run build
```

**Verify build success** - Check terminal output for any errors

---

#### Step 8: Setup Stripe CLI (Optional - for webhook testing)

**Install Stripe CLI**

```bash
# Download and install
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_*_linux_x86_64.tar.gz
tar -xvf stripe_*_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

**Create Stripe Account**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Create account with your **work email**
3. Set **Country** as **United States (US)**
4. Complete account verification

**Join Ninja Concepts Sandbox**

Contact the development team to receive an invite link to the **Ninja Concepts Stripe sandbox account**

**Login to Stripe CLI**

```bash
stripe login
```

This will:
- Open your browser for authentication
- Connect your Stripe account with the CLI
- Provide access to publishable key (pk) and secret key (sk)

**Forward webhooks to local backend**

```bash
stripe listen --forward-to localhost:3000/subscription/webhook
```

**Copy webhook signing secret** - Use this in your backend `.env` file

---

<div style="border-left: 5px solid #42A5F5; padding-left: 15px; margin: 20px 0; background: linear-gradient(90deg, rgba(66, 165, 245, 0.1) 0%, transparent 100%);">

## Installation - Windows

</div>

### Prerequisites Check

#### 1. Verify Node.js Installation

**Check Node.js version**

```bash
node --version
```

**Expected output**: `v18.x.x` or higher

If not installed, download from [nodejs.org](https://nodejs.org/)

---

#### 2. Verify pnpm Installation

**Check pnpm version**

```bash
pnpm --version
```

**Expected output**: `9.0.0`

**Install pnpm globally** (if not installed)

```bash
npm install -g pnpm@9.0.0
```

---

#### 3. Verify Docker Installation

**Check Docker version**

```bash
docker --version
```

**Check Docker daemon status**

```bash
docker ps
```

**Expected**: Docker daemon should be running

If Docker is not installed, install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)

---

#### 4. Verify PostgreSQL Installation

**Check PostgreSQL version**

```bash
psql --version
```

**Expected output**: `psql (PostgreSQL) 16` or higher

**Install PostgreSQL** (if not installed)

Download and install from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)

**Verify PostgreSQL is running**

Open Services (`services.msc`) and check if PostgreSQL service is running

---

### Step-by-Step Installation

#### Step 1: Clone the Repository

**Clone using SSH**

```bash
git clone git@github.com:ninja-concepts/ninja-notes.git
cd ninja-notes
```

**Clone using HTTPS**

```bash
git clone https://github.com/ninja-concepts/ninja-notes.git
cd ninja-notes
```

**Note for new users**: If you're cloning using SSH, you'll need to configure Git with CLI authentication. You can use either:
- **SSH keys**: Set up SSH keys and add them to your GitHub/GitLab account
- **Access token**: Use a personal access token for HTTPS authentication

For detailed instructions on configuring Git authentication, refer to the [Git documentation](https://docs.github.com/en/authentication) or contact the development team.

---

#### Step 2: Setup PostgreSQL Database

**Connect to PostgreSQL**

Open Command Prompt or PowerShell and run:

```bash
psql -U postgres
```

**In PostgreSQL prompt, run:**

```sql
-- Create role
CREATE ROLE ninjanotes_user WITH LOGIN PASSWORD 'your_password';

-- Create database
CREATE DATABASE ninjanotes_db OWNER ninjanotes_user;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE ninjanotes_db TO ninjanotes_user;

-- Exit PostgreSQL
\q
```

**Verify database connection**

```bash
psql -U ninjanotes_user -d ninjanotes_db -h localhost
```

---

#### Step 3: Configure Environment Variables

**Create backend environment file**

```bash
cd apps\backend
type nul > .env
```

**Create frontend environment file**

```bash
cd apps\web
type nul > .env
```

**Configure environment variables** in both `.env` files:
- Database connection details (host, port, user, password, database name)
- API keys and secrets
- Service URLs and ports
- Third-party service credentials

---

#### Step 4: Start Docker Services

**Navigate to backend directory**

```bash
cd apps\backend
```

**Start Docker containers**

```bash
docker compose up -d
```

**Verify Docker containers are running**

```bash
docker ps
```

**Expected containers**:
- `minio` (ports 9000, 9090)
- `redis` (port 6379)
- `livekit` (ports 7880, 7881, 7882)
- `livekit-egress`

**Check container logs** (if needed)

```bash
docker compose logs
```

---

#### Step 5: Install Dependencies

**Navigate to project root**

```bash
cd ..\..
```

**Install all dependencies**

```bash
pnpm install
```

---

#### Step 6: Run Database Migrations

**Run migrations**

```bash
pnpm migration:run
```

**Note**: Migration files already exist in the repository. Only run migrations during installation. Generate migrations only when creating new database schema changes.

---

#### Step 7: Build the Project

**Build all packages and apps**

```bash
pnpm run build
```

**Verify build success** - Check terminal output for any errors

---

#### Step 8: Setup Stripe CLI (Optional - for webhook testing)

**Install Stripe CLI**

Download and install from [Stripe CLI Releases](https://github.com/stripe/stripe-cli/releases)

**Create Stripe Account**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Create account with your **work email**
3. Set **Country** as **United States (US)**
4. Complete account verification

**Join Ninja Concepts Sandbox**

Contact the development team to receive an invite link to the **Ninja Concepts Stripe sandbox account**

**Login to Stripe CLI**

```bash
stripe login
```

This will:
- Open your browser for authentication
- Connect your Stripe account with the CLI
- Provide access to publishable key (pk) and secret key (sk)

**Forward webhooks to local backend**

```bash
stripe listen --forward-to localhost:3000/subscription/webhook
```

**Copy webhook signing secret** - Use this in your backend `.env` file

---

<div style="border-left: 5px solid #9C27B0; padding-left: 15px; margin: 20px 0; background: linear-gradient(90deg, rgba(156, 39, 176, 0.1) 0%, transparent 100%);">

## Running the Application

</div>

### Daily Startup Workflow

> **Note**: Complete the initial installation based on your operating system (see [Installation](#installation) section above) before following these daily startup steps.

When starting the application for daily development, follow these steps:

#### Step 1: Check Docker Containers

**Check if Docker containers are running**

```bash
docker ps
```

**Expected containers**:
- `minio` (ports 9000, 9090)
- `redis` (port 6379)
- `livekit` (ports 7880, 7881, 7882)
- `livekit-egress`

If any containers are down or missing, proceed to Step 2.

---

#### Step 2: Start Docker Services

**Navigate to backend directory**

```bash
cd apps/backend
```

**Start Docker containers**

```bash
docker compose up -d
```

**Verify containers are running**

```bash
docker ps
```

All expected containers should now be running.

---

#### Step 3: Install Dependencies and Build

**Navigate back to project root**

```bash
cd ../..
```

**Install dependencies** (if needed after pulling new changes)

```bash
pnpm install
```

**Build the project**

```bash
pnpm run build
```

---

#### Step 4: Start Development Servers

**Start all services in development mode**

```bash
pnpm run dev
```

**Expected output**:
- Backend running on `http://localhost:3000`
- Frontend running on `http://localhost:5173` (Vite default)

---

### Development Mode

**Start all services**

```bash
pnpm run dev
```

**Expected output**:
- Backend running on `http://localhost:3000`
- Frontend running on `http://localhost:5173` (Vite default)

**Verify services are running**:
- Check terminal logs for successful startup messages
- Backend should show: `Application is running on: http://localhost:3000`
- Frontend should show: `Local: http://localhost:5173`

---

### Useful Development Commands

**Format code**

```bash
pnpm format
```

**Check TypeScript types**

```bash
pnpm check-types
```

**Run specific app**

```bash
# Backend only
pnpm --filter backend dev

# Frontend only
pnpm --filter web dev
```

**Database migrations**

```bash
# Run existing migrations (use during installation)
pnpm migration:run

# Generate new migration (only when creating schema changes)
pnpm migration:generate

# Revert last migration
pnpm migration:revert
```

---

<div style="border-left: 5px solid #F44336; padding-left: 15px; margin: 20px 0; background: linear-gradient(90deg, rgba(244, 67, 54, 0.1) 0%, transparent 100%);">

## Project Structure

</div>

```
ninja-notes/
├── apps/
│   ├── backend/          # NestJS backend application
│   │   ├── src/
│   │   │   ├── modules/   # Feature modules
│   │   │   ├── config/    # Configuration files
│   │   │   └── main.ts    # Application entry point
│   │   ├── docker-compose.yml
│   │   └── .env
│   └── web/              # React frontend application
│       ├── src/
│       │   ├── app/      # Application routes
│       │   ├── components/
│       │   └── api/      # API integration
│       └── .env
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── ui/              # Shared UI components
│   └── typescript-config/ # Shared TypeScript configs
├── package.json         # Root package.json
├── turbo.json          # Turborepo configuration
└── pnpm-workspace.yaml # pnpm workspace configuration
```

### Key Directories

- **`apps/backend/src/modules/`**: Backend feature modules (auth, events, transcripts, etc.)
- **`apps/web/src/`**: Frontend source code
- **`packages/types/`**: Shared TypeScript type definitions
- **`packages/ui/`**: Reusable React components

---

## Port Configurations

| Service | Port | Purpose |
|---------|------|---------|
| Backend API | 3000 | NestJS backend server |
| Frontend | 5173 | Vite dev server (default) |
| MinIO API | 9000 | Object storage API |
| MinIO Console | 9090 | MinIO web console |
| Redis | 6379 | Cache and session store |
| LiveKit API | 7880 | WebSocket/HTTP API |
| LiveKit TCP | 7881 | ICE/TCP fallback |
| LiveKit UDP | 7882 | ICE/UDP mux |

---

<div style="border-left: 5px solid #607D8B; padding-left: 15px; margin: 20px 0; background: linear-gradient(90deg, rgba(96, 125, 139, 0.1) 0%, transparent 100%);">

## Troubleshooting

</div>

### Docker Issues

**Docker containers not starting**

```bash
# Check Docker daemon status
sudo systemctl status docker  # Linux
# macOS/Windows: Check Docker Desktop is running

# Restart Docker daemon
sudo systemctl restart docker  # Linux
# macOS/Windows: Restart Docker Desktop application

# Check container logs
docker compose logs [service-name]
```

**Port already in use**

```bash
# Find process using port
lsof -i :3000  # Linux/macOS
netstat -ano | findstr :3000  # Windows

# Kill process using the port
kill -9 <PID>  # Linux/macOS (replace <PID> with process ID from above)
taskkill /PID <PID> /F  # Windows (replace <PID> with process ID from above)

```

---

### Database Issues

**Cannot connect to PostgreSQL**

```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS
# Windows: Open Services (services.msc) and check PostgreSQL service

# Check PostgreSQL connection
psql -U ninjanotes_user -d ninjanotes_db -h localhost

# Verify database exists
psql -U postgres -c "\l" | grep ninjanotes_db  # Linux/macOS
psql -U postgres -c "\l"  # Windows (then manually check output)
```

**Migration errors**

```bash
# If you pulled new changes with migration files, run migrations
pnpm migration:run

# Revert last migration (if needed)
pnpm migration:revert

# Check migration status
cd apps/backend
npm run typeorm migration:show
```

**Note**: If you pull new changes from the repository that include new migration files, always run `pnpm migration:run` to apply the latest database schema changes.

---

### Build Issues

**TypeScript errors**

```bash
# Check types
pnpm check-types

# Clean and rebuild
rm -rf node_modules apps/*/node_modules packages/*/node_modules  # Linux/macOS
rmdir /s /q node_modules apps\*\node_modules packages\*\node_modules  # Windows

pnpm install
pnpm run build
```

**Dependency issues**

```bash
# Clear pnpm cache
pnpm store prune

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml  # Linux/macOS
rmdir /s /q node_modules & del pnpm-lock.yaml  # Windows

pnpm install
```

---

### Runtime Issues

**Backend not starting**

- Check `.env` file exists in `apps/backend/`
- Verify all required environment variables are set
- Check PostgreSQL connection
- Verify Docker containers are running
- Check port 3000 is available

**Frontend not starting**

- Check `.env` file exists in `apps/web/`
- Verify backend URL in frontend `.env`
- Check port 5173 is available
- Clear browser cache

**WebSocket connection issues**

- Verify Redis is running in Docker
- Check LiveKit container status
- Verify network connectivity

---

### Common Error Messages

**"Cannot find module"**

```bash
# Reinstall dependencies
pnpm install
```

**"Port already in use"**

- Change port in configuration or stop conflicting service

**"Database connection refused"**

- Verify PostgreSQL is running
- Check connection credentials in `.env`
- Verify database exists

**"Docker daemon not running"**

```bash
# Start Docker daemon
sudo systemctl start docker  # Linux
# macOS/Windows: Start Docker Desktop application
```

---

## Additional Resources

- [Backend README](apps/backend/README.md) - Backend-specific documentation
- [Turborepo Documentation](https://turborepo.com/docs) - Monorepo build system
- [NestJS Documentation](https://docs.nestjs.com/) - Backend framework
- [Vite Documentation](https://vite.dev/) - Frontend build tool
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) - Database documentation

---

## Support

For issues or questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review application logs in terminal
- Check Docker container logs
- Contact the development team

---

**Last Updated**: 12/11/2025

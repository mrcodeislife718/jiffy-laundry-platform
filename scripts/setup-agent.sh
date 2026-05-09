#!/bin/bash

# JiffyLaundry Agent Setup Script
# Initializes the development environment for GitHub Copilot agents

set -e

echo "🚀 JiffyLaundry Agent Setup"
echo "===================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing..."
    npm install -g pnpm
fi

if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. Some features may not work."
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install
echo "✅ Dependencies installed"

# Create environment file
echo ""
echo "🔑 Setting up environment..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local (update with your credentials)"
else
    echo "✅ .env.local already exists"
fi

# Start Docker services
echo ""
echo "🐳 Starting Docker services..."
if command -v docker &> /dev/null; then
    pnpm run docker:up
    sleep 5
    echo "✅ Docker services started"
    echo "   pgAdmin: http://localhost:5050"
    echo "   Redis Commander: http://localhost:8081"
else
    echo "⚠️  Docker not available, skipping"
fi

# Setup database
echo ""
echo "🗄️  Setting up database..."
pnpm run db:setup
pnpm run db:migrate
pnpm run db:seed
echo "✅ Database setup complete"

# Build projects
echo ""
echo "🔨 Building projects..."
pnpm run build
echo "✅ Build complete"

echo ""
echo "===================================="
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your credentials:"
echo "   - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY"
echo "   - STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET"
echo "   - RESEND_API_KEY, EXPO_ACCESS_TOKEN"
echo ""
echo "2. Start development servers:"
echo "   pnpm run dev"
echo ""
echo "3. Access the apps:"
echo "   - Admin Dashboard: http://localhost:3000"
echo "   - Backend API: http://localhost:3001"
echo "   - pgAdmin: http://localhost:5050"
echo "   - Redis Commander: http://localhost:8081"

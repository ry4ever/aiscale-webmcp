#!/bin/bash
# setup-neon.sh - Setup script for AIScale WebMCP SDR with Neon PostgreSQL
# Usage: ./setup-neon.sh

set -e

echo "========================================"
echo "AIScale WebMCP SDR - Neon Setup"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Run this script from the project root directory"
    exit 1
fi

# Function to prompt for input
prompt() {
    local var_name=$1
    local description=$2
    local default=$3
    local value

    if [ -n "$default" ]; then
        read -p "$description [$default]: " value
        value=${value:-$default}
    else
        read -p "$description: " value
    fi

    if [ -z "$value" ]; then
        echo "Error: $description is required"
        exit 1
    fi

    eval "$var_name='$value'"
}

echo "Step 1: Create Neon Project"
echo "----------------------------"
echo "1. Go to https://neon.tech and sign up (free tier available)"
echo "2. Create a new project:"
echo "   - Name: webmcp-sdr"
echo "   - Region: Choose closest to your users"
echo "3. In the Neon dashboard, go to Connection Details"
echo "4. Copy the 'Connection string' (looks like: postgresql://user:pass@host/dbname)"
echo ""

prompt "DATABASE_URL" "Paste your Neon connection string (DATABASE_URL)" ""

echo ""
echo "Step 2: Optional API Keys"
echo "-------------------------"
echo "(Press Enter to skip any of these - the app works with mock data)"

read -p "Resend API Key (for real email sending, get from https://resend.com): " RESEND_API_KEY
RESEND_API_KEY=${RESEND_API_KEY:-""}

read -p "Apify API Key (for real LinkedIn scraping, get from https://apify.com): " APOIFY_API_KEY
APOIFY_API_KEY=${APOIFY_API_KEY:-""}

echo ""
echo "Step 3: Creating .env.local"
echo "---------------------------"

cat > .env.local << EOF
# Database (Neon PostgreSQL)
DATABASE_URL=${DATABASE_URL}

# Use real APIs (set to false to use mock data)
USE_MOCK_DATA=false

# Resend (Email sending)
RESEND_API_KEY=${RESEND_API_KEY}

# Apify (LinkedIn scraping)
APIFY_API_KEY=${APOIFY_API_KEY}

# Security (update these for production)
API_KEY=sk-dev-$(openssl rand -hex 16)
ALLOWED_ORIGINS=http://localhost:5173,https://*.vercel.app

# Rate limiting (requests per minute per IP)
RATE_LIMIT=100
EOF

echo "Created .env.local"

echo ""
echo "Step 4: Testing Database Connection"
echo "------------------------------------"

# Check if psql is available
if command -v psql &> /dev/null; then
    echo "Testing connection..."
    PGPASSWORD=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p') psql "$DATABASE_URL" -c "SELECT 1" &> /dev/null && echo "✓ Database connection successful" || echo "✗ Database connection failed"
else
    echo "(psql not installed, skipping connection test)"
    echo "You can test manually with: psql \"$DATABASE_URL\""
fi

echo ""
echo "Step 5: Running Database Migration"
echo "----------------------------------"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run migration
echo "Running migrations..."
npm run db:migrate

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Add environment variables to Vercel:"
echo "   - Go to https://vercel.com/dashboard → your project → Settings → Environment Variables"
echo "   - Add each variable from .env.local"
echo ""
echo "2. Deploy to Vercel:"
echo "   npm run deploy"
echo ""
echo "3. For local development:"
echo "   npm run dev"
echo ""
echo "Files created:"
echo "  - .env.local (your local environment variables)"
echo ""
echo "IMPORTANT: Add .env.local to .gitignore if not already there!"

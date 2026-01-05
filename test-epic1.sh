#!/bin/bash

# EPIC 1 Testing Script
# This script helps verify EPIC 1 setup

echo "🔍 EPIC 1 Testing Setup"
echo "========================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    echo "📝 Create .env file with required variables (see QUICK_START.md)"
    exit 1
else
    echo "✅ .env file exists"
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies installed"
fi

# Check TypeScript
echo ""
echo "🔍 Running TypeScript check..."
npm run typecheck
if [ $? -eq 0 ]; then
    echo "✅ TypeScript check passed"
else
    echo "❌ TypeScript errors found"
    exit 1
fi

# Check Prisma
echo ""
echo "🔍 Checking Prisma setup..."
if npx prisma validate > /dev/null 2>&1; then
    echo "✅ Prisma schema is valid"
else
    echo "❌ Prisma schema has errors"
    exit 1
fi

# Check if database is accessible
echo ""
echo "🔍 Checking database connection..."
if npx prisma db pull --schema=prisma/schema.prisma > /dev/null 2>&1; then
    echo "✅ Database connection OK"
else
    echo "⚠️  Database connection failed - make sure DATABASE_URL is correct"
    echo "   Run: npm run db:push (for development)"
fi

echo ""
echo "✅ Setup check complete!"
echo ""
echo "Next steps:"
echo "1. Ensure DATABASE_URL is set in .env"
echo "2. Run: npm run db:push (to sync database schema)"
echo "3. Run: npm run dev (to start development server)"
echo "4. Visit: http://localhost:3000"
echo ""
echo "See TESTING_GUIDE.md for detailed test scenarios"



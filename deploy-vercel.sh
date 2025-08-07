#!/bin/bash

# CiviGenie Vercel Deployment Script
# This script helps prepare and deploy the application to Vercel

echo "🚀 CiviGenie Vercel Deployment Script"
echo "====================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Found vercel.json"

# Check if all required files exist
echo "🔍 Checking project structure..."

if [ ! -d "client" ]; then
    echo "❌ client directory not found"
    exit 1
fi

if [ ! -d "server" ]; then
    echo "❌ server directory not found"
    exit 1
fi

if [ ! -f "client/package.json" ]; then
    echo "❌ client/package.json not found"
    exit 1
fi

if [ ! -f "server/package.json" ]; then
    echo "❌ server/package.json not found"
    exit 1
fi

echo "✅ Project structure looks good"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed"

# Check if Vercel is already configured
if [ -f ".vercel/project.json" ]; then
    echo "📋 Vercel project already configured"
    echo "🚀 Deploying to Vercel..."
    vercel --prod
else
    echo "🔧 Setting up Vercel project..."
    echo "Please follow the prompts to configure your Vercel project:"
    vercel
fi

echo "✅ Deployment script completed!"
echo ""
echo "📋 Next steps:"
echo "1. Set up environment variables in Vercel dashboard"
echo "2. Configure your MongoDB database"
echo "3. Test your deployment"
echo ""
echo "📖 For detailed instructions, see VERCEL_DEPLOYMENT.md"

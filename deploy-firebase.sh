#!/bin/bash

# Firebase Setup Script
# This script deploys Firestore rules, indexes, and storage rules

echo "🔥 Firebase Setup Script"
echo "======================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed"
    echo "Please install it with: npm install -g firebase-tools"
    echo "Or follow the manual setup instructions in FIREBASE_SETUP.md"
    exit 1
fi

echo "✅ Firebase CLI found"

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please login to Firebase"
    firebase login
fi

echo "✅ Firebase login verified"

# Deploy Firestore rules and indexes
echo "📋 Deploying Firestore rules and indexes..."
firebase deploy --only firestore

if [ $? -eq 0 ]; then
    echo "✅ Firestore rules and indexes deployed successfully"
else
    echo "❌ Failed to deploy Firestore rules and indexes"
    exit 1
fi

# Deploy Storage rules
echo "📁 Deploying Storage rules..."
firebase deploy --only storage

if [ $? -eq 0 ]; then
    echo "✅ Storage rules deployed successfully"
else
    echo "❌ Failed to deploy Storage rules"
    exit 1
fi

echo ""
echo "🎉 Firebase setup complete!"
echo "✅ Security rules deployed"
echo "✅ Composite indexes deployed"
echo "✅ Storage rules deployed"
echo ""
echo "Your app should now work without permission or index errors."
echo "If you still see issues, wait a few minutes for indexes to build."
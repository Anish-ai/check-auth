# Firebase Setup Script for Windows PowerShell
# This script deploys Firestore rules, indexes, and storage rules

Write-Host "🔥 Firebase Setup Script" -ForegroundColor Yellow
Write-Host "======================="

# Check if Firebase CLI is installed
try {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI found: $firebaseVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Firebase CLI is not installed" -ForegroundColor Red
    Write-Host "Please install it with: npm install -g firebase-tools" -ForegroundColor Yellow
    Write-Host "Or follow the manual setup instructions in FIREBASE_SETUP.md" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in
try {
    firebase projects:list | Out-Null
    Write-Host "✅ Firebase login verified" -ForegroundColor Green
}
catch {
    Write-Host "🔐 Please login to Firebase" -ForegroundColor Yellow
    firebase login
}

# Deploy Firestore rules and indexes
Write-Host "📋 Deploying Firestore rules and indexes..." -ForegroundColor Blue
try {
    firebase deploy --only firestore
    Write-Host "✅ Firestore rules and indexes deployed successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to deploy Firestore rules and indexes" -ForegroundColor Red
    exit 1
}

# Deploy Storage rules
Write-Host "📁 Deploying Storage rules..." -ForegroundColor Blue
try {
    firebase deploy --only storage
    Write-Host "✅ Storage rules deployed successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to deploy Storage rules" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Firebase setup complete!" -ForegroundColor Green
Write-Host "✅ Security rules deployed" -ForegroundColor Green
Write-Host "✅ Composite indexes deployed" -ForegroundColor Green  
Write-Host "✅ Storage rules deployed" -ForegroundColor Green
Write-Host ""
Write-Host "Your app should now work without permission or index errors." -ForegroundColor Cyan
Write-Host "If you still see issues, wait a few minutes for indexes to build." -ForegroundColor Yellow
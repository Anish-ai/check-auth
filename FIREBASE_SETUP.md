# Firebase Setup Instructions

## Deploy Firestore Security Rules & Indexes

The application requires Firestore security rules and composite indexes to allow authenticated users to access their data efficiently. Follow these steps to deploy both:

### Method 1: Using Firebase Console (Recommended)

#### Deploy Security Rules
1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `studhub-iitp`
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` file from this project
5. Paste it into the rules editor in the console
6. Click **Publish** to deploy the rules

#### Deploy Composite Indexes
1. In the same Firebase Console, navigate to **Firestore Database** → **Indexes**
2. Click **Add Index** for each collection:

**Projects Index:**
- Collection: `projects`
- Field 1: `userId` (Ascending)
- Field 2: `startDate` (Descending)

**Education Index:**
- Collection: `education` 
- Field 1: `userId` (Ascending)
- Field 2: `startYear` (Descending)

**Courses Index:**
- Collection: `courses`
- Field 1: `userId` (Ascending)
- Field 2: `completionDate` (Descending)

**Achievements Index:**
- Collection: `achievements`
- Field 1: `userId` (Ascending)
- Field 2: `date` (Descending)

**Skills Index:**
- Collection: `skills`
- Field 1: `userId` (Ascending)
- Field 2: `category` (Ascending)

**Positions Index:**
- Collection: `positionsOfResponsibility`
- Field 1: `userId` (Ascending)
- Field 2: `startDate` (Descending)

**Certifications Index:**
- Collection: `certifications`
- Field 1: `userId` (Ascending)
- Field 2: `issueDate` (Descending)

#### Quick Index Creation from Error Links
When you see an index error like the one you encountered, you can also click the link provided in the error message to automatically create that specific index.

### Method 2: Using Firebase CLI

If you have Firebase CLI installed:

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in the project (if not already done)
firebase init

# Deploy only the Firestore rules and indexes
firebase deploy --only firestore

# Deploy Storage rules as well  
firebase deploy --only storage
```

### Storage Rules (CRITICAL - Deploy First!)

**🚨 If you're getting `storage/unauthorized` errors when uploading photos, deploy these rules immediately:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project `studhub-iitp`
3. Navigate to **Storage** → **Rules**
4. **Replace all existing rules** with this exact code:

```javascript
rules_version = '2';

// Cloud Storage for Firebase rules
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload and read their profile photos
    match /profiles/{userId}/photo {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can upload and read project files
    match /projects/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can upload and read certificate files
    match /certificates/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // General user files folder
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

5. Click **Publish**
6. Wait 30 seconds for rules to propagate
7. Try uploading again

The application also uses Firebase Storage for file uploads. Alternative deployment method:

1. In Firebase Console, go to **Storage** → **Rules**
2. Copy contents of `storage.rules` and paste in the editor
3. Click **Publish**

### What the Rules Do

The security rules ensure that:
- Users can only read and write their own data
- All collections are protected by user authentication
- Each user can only access documents where `userId` matches their authentication UID
- Storage files are organized by user ID and protected accordingly

### What the Indexes Do

The composite indexes enable efficient querying of data with multiple conditions:
- **Projects**: Query by userId + sort by startDate (newest first)
- **Education**: Query by userId + sort by startYear (newest first) 
- **Courses**: Query by userId + sort by completionDate (newest first)
- **Achievements**: Query by userId + sort by date (newest first)
- **Skills**: Query by userId + sort by category (alphabetical)
- **Positions**: Query by userId + sort by startDate (newest first)
- **Certifications**: Query by userId + sort by issueDate (newest first)

### Troubleshooting

If you're still seeing errors:

**"Permission denied" errors:**
1. Make sure you're logged in with a valid Firebase user
2. Verify the security rules have been deployed successfully
3. Check that your user has the correct `userId` field in the authentication system
4. Try refreshing your browser to clear any cached permissions

**"The query requires an index" errors:**
1. Click the link provided in the error message to auto-create the index
2. Or manually create the indexes as described above
3. Wait a few minutes for indexes to build after creation
4. Refresh the page and try again

**Index building time:**
- Simple indexes: Usually complete within a few minutes
- Complex indexes: May take longer depending on data size
- You can monitor index build progress in Firebase Console → Indexes

### After Setup Complete

Once both rules and indexes are deployed, users will be able to:
- ✅ Update their profile information (name, phone, email)
- ✅ Add, edit, and delete their portfolio items
- ✅ Upload profile photos and other files
- ✅ View all portfolio sections with proper sorting
- ✅ Experience fast query performance with proper indexing

### Index Error Quick Fix

For the specific error you encountered with projects:
1. Click this link: https://console.firebase.google.com/v1/r/project/studhub-iitp/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9zdHVkaHViLWlpdHAvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3Byb2plY3RzL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCXN0YXJ0RGF0ZRACGgwKCF9fbmFtZV9fEAI
2. Click "Create Index"
3. Wait for it to build (usually 1-2 minutes)
4. Refresh your app and try again
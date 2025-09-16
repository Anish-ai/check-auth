## Smart Student Hub – Azure Login Demo (Web)

Minimal React + Vite app wired with Azure Entra ID (MSAL) to sign in with IITP accounts and display name, email, and OID from the ID token.

### Setup

1) Create a SPA app registration in Azure Entra ID and note the Client ID and Tenant ID.

2) Configure redirect URIs (add `http://localhost:5173`).

3) Create a `.env.local` file in this `web/` folder with:

```
VITE_MSAL_CLIENT_ID=<your-spa-client-id>
VITE_AZURE_TENANT_ID=<your-tenant-id>
VITE_MSAL_REDIRECT_URI=http://localhost:5173
VITE_EASY_AUTH_BASE=https://<your-app>.azurewebsites.net
```

### Run

```
npm install
npm run dev
```

Open the app, click “Sign in with IITP account”, and verify the displayed claims.

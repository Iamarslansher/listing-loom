# ListingLoom

Turn raw product notes into polished, SEO-conscious marketplace listings.

## Get started

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and fill in your Firebase web-app settings and a newly rotated Gemini API key. Never commit `.env.local` or paste API keys into source files.
3. Enable Google and Email/Password sign-in in Firebase Authentication.
4. Create a Firestore database and deploy the rules in `firestore.rules` and the composite index in `firestore.indexes.json`.
5. Run `npm run dev` and open `http://localhost:3000`.

The Firebase web configuration is intended to be public; restrict its API key to your app's domains in Google Cloud Console. Listing generation verifies the Firebase ID token against Google's signing keys and the configured Firebase project before calling Gemini. Access to user and listing documents is restricted by `firestore.rules`. The Gemini API key stays on the server and is only used by `/api/generate`. If a Gemini key is exposed, revoke it and use a replacement.

## Configuration

`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, and `NEXT_PUBLIC_FIREBASE_APP_ID` are required for Firebase. The storage bucket and messaging sender ID can also be configured. `GEMINI_API_KEY` is required to generate listing copy. Missing configuration is shown in the app rather than hidden behind a demo response.

### Firebase says “API key not valid”

The `apiKey` in the Firebase Web app config must be a currently valid Google Cloud API key for the same Firebase project. Copy it from Firebase Console → **Project settings** → **General** → **Your apps** → Web app config, and update `NEXT_PUBLIC_FIREBASE_API_KEY` in `.env.local`. In Google Cloud Console → **APIs & Services** → **Credentials**, check that the key is active and its API restrictions allow **Identity Toolkit API**. If it has website/referrer restrictions, allow the local development origin (including the port in use) and your deployed domain. Restart `npm run dev` after changing environment variables; update Vercel's environment variable and redeploy for production.

Deploy on Vercel by setting the same environment variables in the project settings and publishing the Firestore rules and indexes to Firebase.

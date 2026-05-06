# Nexus Multi-App Suite

An interconnected digital ecosystem featuring a professional portfolio, a persistent e-commerce store, and a centralized authentication system.

## Project Structure

1. **Portfolio** (`/portfolio`)
   - Dynamic project listing.
   - Contact form with backend persistence.
   - Admin Dashboard for CRUD operations on projects and viewing submissions.

2. **E-commerce Store** (`/store`)
   - Product catalog.
   - **Persistent Cart**: Synced to Firestore for authenticated users.
   - Checkout flow with order confirmation.

3. **Auth System** (`/login`, `/register`)
   - JWT-based (Firebase) authentication.
   - Shared user profiles across all apps.
   - Protected routes and role-based permissions.

## Admin Access

To access the Admin Dashboard:
1. Register a new account.
2. In the Firestore console, find your user document in the `users` collection.
3. Change the `role` field from `"user"` to `"admin"`.
4. Refresh the app; an "Admin" link will appear in the navigation.

## Tech Stack

- **Frontend**: React, Tailwind CSS, Motion (Animations), Lucide Icons.
- **Backend**: Node.js/Express (Vite middleware integration).
- **Database/Auth**: Firebase Firestore & Firebase Auth.

## Getting Started

The app is fully configured and ready for production. All data is persisted live to Google Cloud.


# ScholarSync

A clean, simple web app where students can browse scholarships and competitions.

## MVP Overview

This is a **minimum viable product** focused on the core browsing experience:
- ✅ Browse opportunities from Firestore
- ✅ Client-side filtering (education level, academic field)
- ✅ Responsive grid layout
- ✅ Deadline highlighting
- ❌ No authentication (yet)
- ❌ No payments
- ❌ No AI features

---

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, TailwindCSS
- **Backend**: Firebase Firestore
- **Styling**: TailwindCSS

---

## Project Structure

```
/src
  /app
    /browse         # Main browsing page
      page.tsx
    layout.tsx      # Root layout
    globals.css     # Global styles
    page.tsx        # Redirects to /browse
  /components
    OpportunityCard.tsx    # Card component
    FilterPanel.tsx        # Filter dropdowns
  /lib
    firebase.ts     # Firebase initialization
  /services
    opportunityService.ts  # Firestore queries
  /types
    opportunity.ts  # TypeScript interfaces
```

---

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase
- Copy `.env.example` to `.env.local`
- Add your Firebase project credentials (get them from Firebase Console)

### 3. Add Sample Data to Firestore
Create a collection called `opportunities` in your Firestore database with documents having this structure:

```json
{
  "title": "Google Scholarship 2025",
  "provider": "Google",
  "academic_field": "Computer Science",
  "education_level": "Undergraduate",
  "country": "USA",
  "deadline": "2025-06-30",
  "description": "Scholarship for undergraduates pursuing CS degrees.",
  "application_link": "https://example.com/apply"
}
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app. You'll be redirected to `/browse`.

---

## Features

### 1. Browse Page (`/browse`)
- Fetches all opportunities from Firestore
- Displays in a responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- Shows loading spinner while fetching
- Displays error message if fetch fails

### 2. Filtering (Client-Side)
- Filter by **Academic Field** and **Education Level**
- Dropdowns are auto-populated from data
- Filters update UI instantly
- Reset button to clear all filters

### 3. Opportunity Cards
- Display: title, provider, field, level, country, deadline
- Highlight deadlines within 7 days with red badge
- Show "Closed" badge for past deadlines
- "Learn More" button links to application

### 4. Error Handling
- Loading spinner during fetch
- Error message if fetch fails
- "No results" message if no opportunities match filters

---

## Component Details

### OpportunityCard.tsx
Displays a single opportunity with:
- Dynamic deadline highlighting (red if < 7 days)
- Closed badge for past deadlines
- Meta tags for field and level
- External link to application

### FilterPanel.tsx
Manages filtering with:
- Two dropdowns (Academic Field, Education Level)
- Dynamic options extracted from data
- Reset button to clear filters

### BrowsePage (page.tsx)
Main logic:
- Fetches data on mount
- Manages filter state
- Applies filters with `useEffect`
- Handles loading and error states

---

## Data Model

```typescript
interface Opportunity {
  id: string;
  title: string;
  provider: string;
  academic_field: string;
  education_level: string;
  country: string;
  deadline: string;           // ISO 8601 format: YYYY-MM-DD
  description: string;
  application_link: string;
}
```

---

## Firebase Integration

The `getAllOpportunities()` function in `opportunityService.ts`:
- Fetches from the `opportunities` collection
- Returns typed `Opportunity[]`
- Handles document IDs automatically

---

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

---

## Future Enhancements (Not in MVP)

- User authentication & saved opportunities
- Advanced search (text search, location-based)
- Email notifications for deadline reminders
- Admin panel for opportunity management
- Social features (comments, recommendations)

---

## Notes

- All data is from Firestore (no external APIs)
- Filtering is client-side only (no server filtering needed)
- Responsive design works on mobile, tablet, and desktop
- TypeScript ensures type safety throughout

---

## Tech Stack

Frontend

* Next.js
* React
* TailwindCSS

Backend

* Firebase Authentication
* Firestore Database

Automation

* n8n workflows for opportunity ingestion and deadline reminders

Development

* Visual Studio Code
* GitHub Copilot for AI-assisted development


## Project Structure

* browse/ → opportunity discovery pages
* login/ → authentication pages
* saved/ → bookmarked opportunities

components

* OpportunityCard → reusable card for opportunities
* FilterPanel → filtering interface

services

* opportunityService → database queries and data handling

lib

* firebase → Firebase configuration and initialization

types

* TypeScript interfaces for data models

---

## Data Model

Example Opportunity Object

title
provider
description
deadline
education_level
academic_field
country
application_link

Each opportunity is stored in the Firestore collection `opportunities`.

---

## Getting Started

Clone the repository:

git clone https://github.com/YOUR_USERNAME/scholarsync.git

Navigate to the project:

cd scholarsync

Install dependencies:

npm install

Run the development server:

npm run dev

The app will be available at:

http://localhost:3000

## Roadmap

Phase 1 – Core Platform

* Opportunity database
* Browse page
* Filtering system

Phase 2 – User Features

* Authentication
* Bookmark opportunities
* Personal dashboard

Phase 3 – Automation

* Automated scholarship ingestion
* Deadline reminders
* Email notifications

Phase 4 – Intelligence

* Personalized recommendations
* AI-assisted opportunity matching

---

## Vision

ScholarSync aims to become a centralized hub for academic opportunities worldwide, starting with students who often struggle to discover scholarships and competitions early enough to apply.


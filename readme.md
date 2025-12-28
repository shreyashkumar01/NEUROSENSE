# NEUROSENSE AI Healthcare Platform

## Overview
NEUROSENSE is an AI-powered digital therapy platform that connects patients with healthcare providers through intelligent rehabilitation tools. The platform consists of a patient mobile app and a doctor web dashboard, enabling remote therapy monitoring and personalized treatment plans.

## Core Features

### Patient Mobile App
- **Daily Therapy Checklist**: Interactive task list with completion tracking
- **Progress Rings**: Visual indicators for movement, speech, brain, and mood metrics
- **Weekly Progress Charts**: Historical data visualization showing improvement trends
- **Video-Guided Exercises**: Instructional content for rehabilitation activities
- **Voice Feedback System**: AI-powered motivational and corrective audio responses
- **Offline Mode**: Functionality indicator showing available features without internet
- **Emergency Help Button**: Quick access to support or emergency contacts

### Doctor Web Dashboard
- **Patient Management**: List view of all patients with real-time health status indicators
- **AI Insights Panel**: Automated analysis and alerts based on patient data
- **Progress Analytics**: Comprehensive charts tracking motor, speech, and cognitive improvements
- **Therapy Plan Editor**: Interactive tools with sliders and toggles to customize treatment plans
- **Report Generation**: Downloadable PDF reports for patient progress and treatment summaries
- **Communication Hub**: Messaging system and note-taking for patient interactions

## System Requirements

Before running NEUROSENSE locally, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher ([Download here](https://nodejs.org/))
- **npm**: Comes with Node.js (version 8.0 or higher)
- **Git**: (Optional, only if cloning from a repository)

> **Note**: Make sure you have at least 8GB of RAM and 5GB of free disk space for optimal performance.

### Verify Installation

Open a terminal/command prompt and run:

```bash
node --version  # Should show v18.0.0 or higher
npm --version   # Should show 8.0.0 or higher
```

## Quick Start (Frontend Only)

The frontend can run standalone using a mock backend that stores data in your browser's localStorage. This is the easiest way to get started.

### Step 1: Navigate to the Frontend Directory

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages. This may take a few minutes on first run.

### Step 3: Start the Development Server

```bash
npm run dev
```

The application will start and automatically open in your default browser at `http://localhost:5173`.

If it doesn't open automatically, navigate to `http://localhost:5173` manually.

### Step 4: Use the Application

1. **Landing Page**: You'll see the NEUROSENSE landing page
2. **Login**: Click the login button (uses mock authentication for local development)
3. **Profile Setup**: Complete your profile - choose either "Patient" or "Doctor" user type
4. **Dashboard**: Once your profile is set up, you'll see the appropriate dashboard

### Available Scripts

In the `frontend` directory, you can run:

- `npm run dev` - Starts the development server (recommended for development)
- `npm run build` - Builds the app for production
- `npm run preview` - Preview the production build locally

## Project Structure

```
NeuroSense/
├── frontend/                  # React + TypeScript frontend application
│   ├── src/
│   │   ├── pages/            # Main page components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── PatientDashboard.tsx
│   │   │   └── DoctorDashboard.tsx
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useActor.ts   # Backend actor interface (mock implementation)
│   │   │   └── useInternetIdentity.tsx  # Authentication hook
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Application entry point
│   ├── index.html            # HTML template
│   ├── package.json          # Dependencies and scripts
│   ├── vite.config.ts        # Vite configuration
│   └── tailwind.config.js    # Tailwind CSS configuration
├── backend/                   # Motoko backend (Internet Computer canisters)
│   ├── main.mo               # Main canister actor
│   └── authorization/        # Access control modules
└── README.md                 # This file
```

## Development Mode Details

### Mock Backend
The application currently uses a **mock backend** implementation that:
- Stores all data in your browser's `localStorage`
- Provides mock authentication (no real Internet Identity required)
- Works completely offline after the initial page load
- Persists data across browser sessions

### Data Persistence
All data (profiles, progress, exercises, etc.) is stored locally in your browser. To clear all data:
1. Open browser DevTools (F12)
2. Go to the "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Clear "Local Storage" for `http://localhost:5173`

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, you'll see an error. You can:

**Option 1**: Stop the process using port 5173
```bash
# Windows PowerShell
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use a different port by editing vite.config.ts
```

**Option 2**: Change the port in `frontend/vite.config.ts`:
```typescript
server: {
  port: 3000,  // Change to any available port
  open: true,
}
```

### Module Not Found Errors

If you encounter module not found errors:

```bash
cd frontend
rm -rf node_modules package-lock.json  # On Windows: rmdir /s node_modules & del package-lock.json
npm install
```

### Build Errors

If you get TypeScript or build errors:

1. Make sure you're using Node.js 18+ and npm 8+
2. Clear the cache and reinstall:
   ```bash
   cd frontend
   npm cache clean --force
   npm install
   ```

### Browser Compatibility

The application works best in modern browsers:
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

### Styles Not Loading

If styles don't appear:
1. Make sure Tailwind CSS compiled properly
2. Check browser console for errors
3. Try clearing browser cache (Ctrl+Shift+R or Cmd+Shift+R)

## Backend Development (Optional)

The project includes a Motoko backend for Internet Computer integration. This is optional for local development since the frontend uses a mock backend.

### Setting Up Backend (Advanced)

If you want to use the real backend:

1. **Install DFX SDK**: Follow instructions at [dfinity.org](https://internetcomputer.org/docs/current/developer-docs/setup/install/)

2. **Create dfx.json** in the project root:
   ```json
   {
     "version": 1,
     "canisters": {
       "neurosense_backend": {
         "main": "backend/main.mo",
         "type": "motoko"
       }
     }
   }
   ```

3. **Start Local Replica**:
   ```bash
   dfx start --background
   ```

4. **Deploy Canisters**:
   ```bash
   dfx deploy
   ```

5. **Update Frontend**: Modify `frontend/src/hooks/useActor.ts` to use the real actor instead of MockActor

> **Note**: Backend setup is complex and requires understanding of Internet Computer development. For local development and testing, the mock backend is recommended.

## Technology Stack

- **Frontend Framework**: React 18.2+
- **Build Tool**: Vite 7.3+
- **Language**: TypeScript 5.2+
- **Styling**: Tailwind CSS 3.3+
- **UI Components**: Radix UI primitives
- **State Management**: React Query (TanStack Query)
- **Charts**: Recharts
- **Backend**: Motoko (Internet Computer) - optional for local dev

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Getting Help

If you encounter issues:

1. Check the browser console (F12) for error messages
2. Verify Node.js and npm versions meet requirements
3. Try clearing node_modules and reinstalling dependencies
4. Check that port 5173 is available
5. Ensure you're in the `frontend` directory when running commands

## Next Steps

Once the application is running:

1. **Explore Patient Dashboard**: Login and create a patient profile to see therapy tracking features
2. **Explore Doctor Dashboard**: Login and create a doctor profile to see the healthcare provider interface
3. **Test Features**: Try the progress tracking, therapy checklist, and AI insights panels
4. **Customize**: Modify components in `frontend/src` to customize the application

## License

This project is part of the NEUROSENSE healthcare platform.

---

**Happy Coding! 🚀**

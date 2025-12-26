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

## AI System Components
The platform integrates multiple AI modules:
- **Camera AI**: Analyzes posture and movement patterns during exercises
- **Voice AI**: Evaluates speech clarity and emotional indicators
- **Cognitive AI**: Assesses memory retention and reaction times through interactive tests
- **Adaptive AI**: Automatically adjusts exercise difficulty based on patient performance
- **Prediction AI**: Identifies concerning trends and generates alerts for healthcare providers

## System Architecture
- **Mobile Application**: Patient-facing interface with offline capabilities
- **Web Dashboard**: Healthcare provider interface with real-time data access
- **AI Processing Layer**: Cloud-based analysis of patient data and exercise performance
- **Secure Data Storage**: Encrypted patient information and progress tracking
- **Analytics Engine**: Report generation and trend analysis tools

## Security & Privacy
- Secure user authentication for both patients and healthcare providers
- End-to-end encryption for all patient data transmission and storage
- Consent-based data sharing between patients and assigned healthcare providers
- Role-based access control ensuring only authorized doctors can view patient information
- Compliance with healthcare privacy regulations (HIPAA/GDPR standards)

## Development Phases
**Phase 1 - MVP**: Core exercise tracking and basic progress visualization
**Phase 2 - AI Integration**: Implementation of camera, voice, and cognitive analysis
**Phase 3 - Healthcare Provider Tools**: Doctor dashboard and communication features
**Phase 4 - Enterprise Scaling**: Hospital integration and partnership-ready features

## Data Storage Requirements
The backend must store:
- Patient profiles and medical information
- Exercise completion data and performance metrics
- AI analysis results and progress trends
- Therapy plans and treatment schedules
- Doctor-patient communication logs
- Generated reports and analytics data

## User Authentication
- Separate login systems for patients and healthcare providers
- Multi-factor authentication for healthcare provider accounts
- Patient data access restricted to assigned healthcare providers only

## How to Run NEUROSENSE Locally

### System Requirements
Before running NEUROSENSE locally, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher
- **pnpm**: Package manager (install with `npm install -g pnpm`)
- **DFX SDK**: DFINITY Canister SDK version 0.15.0 or higher
- **Internet Identity**: Local Internet Identity setup for authentication

> **Note**: Make sure you have at least 8GB of RAM and 10GB of free disk space for optimal performance.

### Project Setup

1. **Clone or Extract the NEUROSENSE Project**
   ```bash
   # If cloning from repository
   git clone <repository-url>
   cd neurosense
   
   # If extracting from ZIP file
   unzip neurosense.zip
   cd neurosense
   ```

2. **Directory Structure Overview**
   The project structure should look like this:
   ```
   neurosense/
   ├── src/                    # Backend Motoko code
   ├── frontend/               # React frontend application
   ├── dfx.json               # DFX configuration
   ├── package.json           # Project dependencies
   └── README.md              # Project documentation
   ```

3. **Install Dependencies**
   ```bash
   pnpm install
   ```

### Running the Backend

1. **Start the Local Internet Computer Replica**
   Open a new terminal and run:
   ```bash
   dfx start --background
   ```
   > This starts the local replica in the background. Keep this running throughout development.

2. **Deploy Backend Canisters**
   In the project directory, run:
   ```bash
   dfx deploy
   ```
   > This deploys both the backend canister and Internet Identity locally.

3. **Verify Deployment**
   Check canister status:
   ```bash
   dfx canister status --all
   ```
   
   View local canister URLs:
   ```bash
   dfx canister id --all
   ```

### Running the Frontend

1. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

2. **Start the Development Server**
   ```bash
   pnpm dev
   ```
   > The frontend will be available at `http://localhost:5173`


**Port Conflicts**
If you encounter port conflicts, stop dfx and restart with a different port:

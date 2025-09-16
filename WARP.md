# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
- `npm install` - Install dependencies
- `npm start` or `expo start` - Start development server with QR code
- `npm run android` - Start on Android emulator/device
- `npm run ios` - Start on iOS simulator/device
- `npm run web` - Start web development server
- `npm run lint` - Run ESLint for code quality checks
- `npm run reset-project` - Reset to clean project structure (moves starter code to app-example/)

### Running Single Components/Screens
- Individual screens are accessible through file-based routing in the `app/` directory
- Use Expo Dev Tools or modify the initial route in `app/(auth)/index.tsx` to test specific screens
- Mock data is available in components like `Dashboard.tsx` for offline development

## Architecture Overview

### Project Structure
This is a React Native mobile application built with Expo Router (v6) using file-based routing. The app appears to be a student dropout prediction system with authentication and dashboard functionality.

**Key Architectural Patterns:**
- **File-based Routing**: Uses Expo Router with route groups in parentheses like `(auth)` and `(tabs)`
- **Component-Service Architecture**: Separates UI components from business logic (services layer)
- **Mock Data Fallbacks**: Components gracefully degrade to mock data when API calls fail
- **Global State via Props**: Simple prop drilling pattern for screen navigation and state management

### Technology Stack
- **Framework**: React Native with Expo SDK ~54.0.7
- **Routing**: Expo Router v6 with typed routes enabled
- **Styling**: TailwindCSS via NativeWind v4
- **UI Components**: Custom components using Lucide React Native icons
- **Charts**: react-native-chart-kit for data visualization
- **Storage**: AsyncStorage for local data persistence
- **Development**: TypeScript with strict mode, ESLint with Expo config

### Core Application Flow
1. **Entry Point**: `app/_layout.tsx` - Root layout with global CSS import
2. **Authentication Flow**: Handled in `app/(auth)/` route group
3. **Main App**: Single screen app with state-based navigation in `app/(auth)/index.tsx`
4. **Services Layer**: `services/authService.ts` handles all API communication with fallbacks

### Key Components
- **Authentication System**: Full auth flow with login, password reset, and signup capabilities
- **Dashboard**: Data visualization with charts showing student metrics, GPA trends, and dropout risk analysis
- **API Integration**: Backend integration at `localhost:5000` with graceful degradation to mock data
- **Mobile-First Design**: Responsive components using React Native's Dimensions API

### Backend Integration
- API base URL: `http://localhost:5000`
- Authentication uses Bearer token pattern stored in AsyncStorage
- Endpoints: `/auth/*` for authentication, `/api/*` for application data
- Automatic fallback to mock data when backend is unavailable

## Development Notes

### Local Development Setup
- Backend expected to run on `localhost:5000`
- Change `API_BASE_URL` in `services/authService.ts` when testing on physical devices (use IP address)
- Demo user can be created using the `create-demo-user.js` script

### Configuration Files
- `app.json`: Expo configuration with new architecture enabled and typed routes
- `tailwind.config.js`: Configured for `app/` and `components/` directories with NativeWind preset
- `tsconfig.json`: TypeScript config with path aliases (`@/*` maps to `./`)

### Testing & Debugging
- Use Expo Dev Tools for debugging and network inspection
- Components have extensive error handling and console logging
- Mock data is embedded in components for offline development and testing

### Platform Considerations
- iOS: Supports tablets, uses adaptive icons
- Android: Edge-to-edge enabled, predictive back gesture disabled
- Web: Uses Metro bundler with static output
- All platforms support the same codebase with minimal platform-specific code
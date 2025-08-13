# European Portuguese Tutor - Live Conversation App

## Overview

This is a browser-based European Portuguese language tutoring application that provides real-time voice conversations with an AI tutor. The application features a single-button interface for starting and stopping live voice sessions, with hands-free operation and unscripted conversational AI. Built with modern web technologies, it delivers a seamless language learning experience through natural voice interactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: React hooks with custom state management for conversation flow
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query for server state management

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Real-time Communication**: WebSocket server for live audio streaming
- **Session Management**: In-memory storage with session tracking and cleanup
- **Audio Processing**: Native browser Web Audio APIs with real-time streaming
- **Development**: Hot reload with Vite middleware integration

### Database and Storage
- **Database**: PostgreSQL with Drizzle ORM for schema management
- **Session Storage**: Hybrid approach with in-memory storage for active sessions and database persistence for session metadata
- **No User Data Persistence**: Audio conversations are not recorded or stored permanently

### Authentication and Authorization
- **Browser Permissions**: Microphone access through Web APIs
- **Session Management**: UUID-based session identification without user authentication
- **Rate Limiting**: Concurrent session limits (30 max) to prevent resource exhaustion

### Core Features Architecture
- **Single Button Interface**: Simplified UX with one-click start/stop functionality
- **Hands-free Operation**: Continuous listening mode without manual mic toggling
- **Real-time Status Updates**: Live conversation state management with visual feedback
- **Cross-platform Compatibility**: Responsive design for desktop and mobile browsers

### Audio Pipeline
- **Input**: Browser microphone via getUserMedia API
- **Processing**: Real-time audio streaming through WebSocket connections
- **Output**: Browser audio playback with seamless conversation flow
- **Quality**: 16kHz PCM audio with echo cancellation and noise suppression

## External Dependencies

### AI and Speech Services
- **Google Gemini AI**: Gemini 2.5 Native Live model for speech-to-text, text-to-speech, and conversational AI
- **LiveKit**: Real-time audio streaming infrastructure for low-latency voice communication

### Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database operations and schema management

### Frontend Libraries
- **React Ecosystem**: React 18 with hooks and modern patterns
- **UI Framework**: Radix UI primitives with Shadcn/ui component system
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **Icons**: Lucide React for consistent iconography
- **Forms**: React Hook Form with Zod validation

### Development and Build Tools
- **Build System**: Vite for fast development and optimized production builds
- **Type Safety**: TypeScript with strict configuration
- **Code Quality**: ESLint and Prettier (configured but not visible in current files)
- **Package Management**: npm with lockfile for dependency consistency

### Runtime Dependencies
- **WebSocket**: Native WebSocket for real-time communication
- **Audio APIs**: Web Audio API and MediaDevices for microphone access
- **Session Management**: UUID generation for session identification
- **Error Handling**: Centralized error boundaries and toast notifications
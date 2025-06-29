# Frontend Application Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Getting Started](#getting-started)
4. [Project Structure](#project-structure)
5. [Architecture](#architecture)
6. [Components](#components)
7. [Routing](#routing)
8. [API Integration](#api-integration)
9. [Authentication](#authentication)
10. [State Management](#state-management)
11. [Styling](#styling)
12. [Development Guidelines](#development-guidelines)
13. [Build & Deployment](#build--deployment)

## Project Overview

This is a React-based frontend application for an Employee Management System (EMS) that provides different interfaces for various user roles:

- **Admin/HR**: Full system management capabilities
- **Reporting Manager (RM)**: Team management and leave approval
- **Employee**: Personal leave management and profile

The application features a modern, responsive UI built with Material-UI components and provides seamless integration with a Laravel backend API.

## Technology Stack

### Core Technologies
- **React 19.1.0** - Frontend framework
- **Vite 6.3.5** - Build tool and development server
- **React Router DOM 7.6.2** - Client-side routing

### UI Libraries
- **Material-UI (MUI) 7.1.2** - Component library
- **MUI Icons** - Icon library
- **MUI Data Grid** - Data table components
- **MUI Date Pickers** - Date selection components
- **Bootstrap 5.3.7** - Additional styling framework
- **Bootstrap Icons** - Additional icon set

### HTTP Client & Data
- **Axios 1.10.0** - HTTP client for API calls
- **Chart.js 4.5.0** - Charting library
- **React Chart.js 2** - React wrapper for Chart.js

### Utilities
- **Date-fns 2.30.0** - Date manipulation
- **Day.js 1.11.13** - Lightweight date library
- **Lucide React** - Modern icon library
- **React Icons** - Popular icon libraries

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Backend API running on `http://localhost:8000`

### Installation

1. **Clone the repository and navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` (or the URL shown in terminal)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images and static files
│   ├── components/        # Reusable UI components
│   ├── Login/            # Authentication components
│   ├── navbars/          # Navigation components
│   ├── Pages/            # Page components organized by role
│   │   ├── Admin/        # Admin/HR specific pages
│   │   ├── Employee/     # Employee specific pages
│   │   └── EmployeeRM/   # Reporting Manager pages
│   ├── api.js            # API service functions
│   ├── App.jsx           # Main application component
│   ├── App.css           # Global styles
│   ├── index.css         # Base styles
│   └── main.jsx          # Application entry point
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
└── eslint.config.js      # ESLint configuration
```

## Architecture

### Component Architecture
The application follows a hierarchical component structure:

1. **App.jsx** - Root component with routing and authentication
2. **Page Components** - Role-specific page layouts
3. **Navigation Components** - Role-specific navigation bars
4. **Reusable Components** - Shared UI components

### Authentication Flow
1. User submits login credentials
2. Backend validates and returns JWT token
3. Token stored in localStorage
4. User redirected based on role
5. Protected routes check authentication status

### Role-Based Access Control
- **Admin/HR**: Access to `/overview`, `/onboard`, `/people`, etc.
- **Reporting Manager**: Access to `/employeerm`, `/leave-request-rm`, etc.
- **Employee**: Access to `/employee`, `/leave-apply`, etc.

## Components

### Core Components

#### Login Component (`src/Login/Login.jsx`)
- Handles user authentication
- Form validation and error handling
- Role-based routing after successful login
- Material-UI styled interface

#### Navigation Components (`src/navbars/`)
- **AdminNav.jsx** - Admin/HR navigation
- **EmpNav.jsx** - Employee navigation  
- **EmpRMNav.jsx** - Reporting Manager navigation

### Page Components

#### Admin Pages (`src/Pages/Admin/`)
- **Overview.jsx** - Dashboard with system statistics
- **Onboard.jsx** - Employee onboarding workflow
- **People.jsx** - Employee management
- **EditEmployee.jsx** - Employee editing interface
- **Settings/** - System configuration pages

#### Employee Pages (`src/Pages/Employee/`)
- **Employee.jsx** - Employee dashboard
- **LeaveApply.jsx** - Leave application form
- **Profile.jsx** - Personal profile management
- **Settings.jsx** - Personal settings

#### Reporting Manager Pages (`src/Pages/EmployeeRM/`)
- **EmployeeRM.jsx** - RM dashboard
- **LeaveApplyRM.jsx** - Leave application for RM
- **Leaverequests.jsx** - Team leave request management
- **ProfileRM.jsx** - RM profile management

### Reusable Components (`src/components/`)
- **AddHolidayForm.jsx** - Holiday creation form
- **AddLeaveForm.jsx** - Leave application form
- **EditHolidayForm.jsx** - Holiday editing form

## Routing

### Route Structure
```jsx
<Routes>
  <Route path="/" element={<Login />} />
  
  {/* Admin/HR Routes */}
  <Route path="/overview" element={<Overview />} />
  <Route path="/onboard" element={<Onboard />} />
  <Route path="/people" element={<People />} />
  <Route path="/edit-employee/:id" element={<EditEmployee />} />
  <Route path="/leavesettings" element={<LeaveSettings />} />
  <Route path="/holidaycalendar" element={<HolidayCalendar />} />

  {/* Employee Routes */}
  <Route path="/employee" element={<Employee />} />
  <Route path="/leave-apply" element={<LeaveApply />} />
  <Route path="/notifications" element={<Notifications />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/settings" element={<Settings />} />

  {/* Reporting Manager Routes */}
  <Route path="/employeerm" element={<EmployeeRM />} />
  <Route path="/leave-apply-rm" element={<LeaveApplyRM />} />
  <Route path="/leave-request-rm" element={<LeaveRequestRM />} />
  <Route path="/notifications-rm" element={<NotificationsRM />} />
  <Route path="/profile-rm" element={<ProfileRM />} />
  <Route path="/settings-rm" element={<SettingsRM />} />
</Routes>
```

### Authentication Guards
- Routes are protected based on authentication status
- Automatic redirects based on user role
- Fallback to login page for unauthenticated users

## API Integration

### API Configuration (`src/api.js`)
The application uses Axios for HTTP requests with the following features:

- **Base URL**: `http://localhost:8000/api`
- **Authentication**: Automatic Bearer token injection
- **Error Handling**: Automatic logout on 401 errors
- **Request/Response Interceptors**: Global error handling

### API Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

#### Employee Management
- `GET /employees` - Get all employees
- `POST /employees` - Create employee
- `PUT /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee
- `PATCH /employees/:id/active` - Toggle employee status

#### Leave Management
- `GET /leave-types` - Get leave types
- `POST /leave-types` - Create leave type
- `PUT /leave-types/:id` - Update leave type
- `DELETE /leave-types/:id` - Delete leave type
- `GET /leaves` - Get leave requests
- `POST /leaves` - Submit leave request
- `PATCH /leaves/:id/status` - Update leave status

#### Holiday Management
- `GET /holidays` - Get holidays
- `POST /holidays` - Create holiday
- `PUT /holidays/:id` - Update holiday
- `DELETE /holidays/:id` - Delete holiday

### Error Handling
- Network error detection
- HTTP status code handling
- User-friendly error messages
- Automatic retry mechanisms

## Authentication

### JWT Token Management
- Tokens stored in localStorage
- Automatic token injection in API requests
- Token expiration handling
- Secure logout process

### Role-Based Access
- User roles: `admin`, `hr`, `rm`, `employee`
- Route protection based on roles
- UI adaptation based on permissions
- Automatic redirects for unauthorized access

### Security Features
- CSRF protection
- Secure token storage
- Automatic session cleanup
- Cross-tab authentication sync

## State Management

### Local State
- React hooks for component state
- Form state management
- Loading states
- Error states

### Global State
- Authentication state in localStorage
- User information persistence
- Cross-component data sharing

### Data Flow
1. User actions trigger API calls
2. API responses update local state
3. UI re-renders with new data
4. Error states handled gracefully

## Styling

### Design System
- **Primary Color**: `#941936` (Burgundy)
- **Secondary Colors**: Material-UI default palette
- **Typography**: Material-UI typography system
- **Spacing**: Material-UI spacing system

### Styling Approach
- **Material-UI Components**: Primary UI framework
- **CSS-in-JS**: Component-specific styles
- **Responsive Design**: Mobile-first approach
- **Theme Customization**: Consistent branding

### CSS Architecture
- **Global Styles**: `src/index.css`
- **Component Styles**: `src/App.css`
- **Inline Styles**: Material-UI sx prop
- **Custom Components**: Styled components when needed

## Development Guidelines

### Code Style
- Use functional components with hooks
- Follow React best practices
- Implement proper error boundaries
- Use TypeScript for type safety (when available)

### Component Guidelines
- Keep components focused and single-purpose
- Use proper prop validation
- Implement loading and error states
- Follow naming conventions

### API Integration
- Use centralized API service
- Implement proper error handling
- Use loading states for better UX
- Cache data when appropriate

### Performance
- Use React.memo for expensive components
- Implement proper dependency arrays in useEffect
- Optimize re-renders
- Use lazy loading for routes

## Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Build Output
- Optimized static files in `dist/` directory
- Minified JavaScript and CSS
- Asset optimization
- Tree shaking for unused code

### Deployment Considerations
- Configure API base URL for production
- Set up environment variables
- Configure CORS settings
- Set up proper caching headers

### Environment Configuration
- Development: `http://localhost:8000/api`
- Production: Configure via environment variables
- Staging: Separate API endpoints

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify backend server is running
   - Check CORS configuration
   - Validate API base URL

2. **Authentication Issues**
   - Clear localStorage
   - Check token expiration
   - Verify login credentials

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check for dependency conflicts
   - Verify Node.js version

4. **Routing Issues**
   - Check route definitions
   - Verify authentication guards
   - Validate role-based access

### Debug Tools
- React Developer Tools
- Browser Network tab
- Console logging
- Material-UI theme inspector

## Contributing

### Development Workflow
1. Create feature branch
2. Implement changes
3. Test thoroughly
4. Submit pull request
5. Code review process

### Testing
- Manual testing for all user roles
- Cross-browser compatibility
- Mobile responsiveness
- API integration testing

### Documentation
- Update README for new features
- Document API changes
- Maintain component documentation
- Update deployment guides 
# MicroTrax Admin Interface Documentation

## Overview
MicroTrax Admin is a comprehensive dashboard for managing in-game microtransactions, products, and team members. The interface is built with React, TypeScript, and Tailwind CSS, featuring a responsive design that works across all device sizes.

## Pages and Components

### 1. Login Page (`/login`)
**Location:** `src/pages/Login.tsx`
- Email and password authentication
- Error handling and loading states
- Responsive layout with centered form
- Components used:
  - `Logo` - Brand logo display
  - `Input` - Form input fields
  - `Button` - Submit button

### 2. Dashboard (`/`)
**Location:** `src/pages/Dashboard.tsx`
- Overview of key metrics and recent activity
- Components:
  - `StatCard` - Displays individual statistics with icons
    - Total Revenue
    - Transactions
    - Active Users
    - Products Sold
  - `RevenueChart` - Interactive revenue visualization
    - 30-day revenue trend
    - Responsive scaling
    - Gradient-filled bars
  - `TopProducts` - List of best-performing products
    - Product name
    - Sales count
    - Revenue
    - Trend indicators
  - `RecentTransactions` - Latest transaction table
    - Transaction ID
    - Date
    - User
    - Product
    - Amount
    - Status indicators

### 3. Products Page (`/products`)
**Location:** `src/pages/Products.tsx`
- Product management interface
- Components:
  - `ProductModal` - Add/Edit product form
    - Product name
    - Description
    - Price
    - Type selection
    - Active status
  - Product listing table
    - Search functionality
    - Status filters
    - Edit/Delete actions

### 4. Transactions Page (`/transactions`)
**Location:** `src/pages/Transactions.tsx`
- Transaction history and monitoring
- Features:
  - Advanced filtering
    - Date range
    - Status
    - Search by ID/user/product
  - Transaction statistics
  - Export functionality
  - Detailed transaction table

### 5. API Keys Page (`/api-keys`)
**Location:** `src/pages/ApiKeys.tsx`
- API key management
- Features:
  - Generate new API keys
  - View existing keys
  - Revoke access
  - Copy key functionality
  - Usage tracking

### 6. Profile & Team Page (`/profile`)
**Location:** `src/pages/Profile.tsx`
- User profile and team management
- Sections:
  - Profile Information
    - Name
    - Email
    - Password change
  - Team Management
    - Invite new members
    - Role assignment
    - Member listing
    - Remove members

### 7. Settings Page (`/settings`)
**Location:** `src/pages/Settings.tsx`
- Application configuration
- Sections:
  - Company Information
  - In-Game Currency Settings
  - Webhook Configuration
  - Email Notifications

## Layout Components

### AppLayout (`src/components/layout/AppLayout.tsx`)
- Main layout wrapper
- Components:
  - `Header` - Top navigation bar
    - Menu toggle
    - Page title
    - Notifications
    - User menu
  - `Sidebar` - Main navigation
    - Logo
    - Navigation links
    - Responsive toggle
  - `Footer` - Bottom section
    - Copyright
    - Links

### Common Components

#### Logo (`src/components/common/Logo.tsx`)
- Brand identity component
- Customizable size
- Gradient background

#### UI Components (`src/components/ui/`)
- `Button.tsx` - Reusable button component
  - Multiple variants
  - Loading states
  - Icon support
- `Input.tsx` - Form input component
  - Label support
  - Error states
  - Icon integration

## Integration Guide

### Authentication
1. Implement login functionality using the `AuthContext`
2. Handle token storage and refresh
3. Protect routes using `ProtectedRoute` component

### API Integration
1. Connect to backend endpoints
2. Handle error states
3. Implement real-time updates where needed

### Customization
1. Update theme colors in `tailwind.config.js`
2. Modify component styles in respective files
3. Add new features by extending existing components

## Responsive Design
- Mobile-first approach
- Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
- Adaptive layouts for all screen sizes
- Touch-friendly interactions
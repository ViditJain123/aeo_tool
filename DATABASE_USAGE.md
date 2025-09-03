# Database Connection and Usage Guide

## Overview

This guide shows you how to use the MongoDB database connection utilities in your Next.js application.

## Setup

### 1. Environment Variables

Add your MongoDB connection string to `.env.local`:

```env
MONGO_URI=mongodb://localhost:27017/your-database-name
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
```

### 2. Files Structure

```
src/
├── utils/
│   ├── dbConnect.ts          # Main database connection utility
│   └── database.ts           # Database operations helper
├── models/
│   └── Onboarding.ts         # Mongoose model for onboarding data
```

## Basic Usage

### 1. Simple Database Connection

```typescript
import dbConnect from '@/utils/dbConnect';

// In any API route or server-side function
export async function handler() {
  try {
    await dbConnect();
    console.log('Connected to database!');
    
    // Your database operations here
    
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}
```

### 2. Using Database Utilities

```typescript
import { createOnboarding, findOnboardingById } from '@/utils/database';

// Create a new onboarding record
const newOnboarding = await createOnboarding({
  brandName: 'My Company',
  website: 'https://mycompany.com',
  crawlResult: { /* crawl data */ },
  analysisQueries: { /* analysis data */ }
});

// Find by ID
const onboarding = await findOnboardingById(newOnboarding._id);
```

## API Routes Examples

### 1. Basic CRUD API Route

```typescript
// src/app/api/onboardings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createOnboarding, getAllOnboardings } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const result = await getAllOnboardings(page, limit);
    
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const onboarding = await createOnboarding(data);
    
    return NextResponse.json({
      success: true,
      data: onboarding
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
```

### 2. Search API Route

```typescript
// src/app/api/onboardings/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchOnboardings } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const result = await searchOnboardings(query, page, limit);
    
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
```

## Available Database Operations

### DatabaseUtils Class Methods

```typescript
import { DatabaseUtils } from '@/utils/database';

// Create
const onboarding = await DatabaseUtils.createOnboarding({
  brandName: 'Example Corp',
  website: 'https://example.com'
});

// Read
const byId = await DatabaseUtils.findOnboardingById('64a7b8c9d1e2f3a4b5c6d7e8');
const byBrand = await DatabaseUtils.findOnboardingByBrandName('Example');
const byWebsite = await DatabaseUtils.findOnboardingByWebsite('https://example.com');

// Update
const updated = await DatabaseUtils.updateOnboarding('64a7b8c9d1e2f3a4b5c6d7e8', {
  brandName: 'Updated Name'
});

// Delete
const deleted = await DatabaseUtils.deleteOnboarding('64a7b8c9d1e2f3a4b5c6d7e8');

// List with pagination
const { data, total, page, totalPages } = await DatabaseUtils.getAllOnboardings(1, 10);

// Search
const searchResults = await DatabaseUtils.searchOnboardings('company', 1, 10);

// Statistics
const stats = await DatabaseUtils.getOnboardingStats();
```

## Connection Management

### Connection State Monitoring

```typescript
import { isConnected, getConnectionState, waitForConnection } from '@/utils/dbConnect';

// Check if connected
if (isConnected()) {
  console.log('Database is ready!');
}

// Get current state
console.log('Connection state:', getConnectionState());

// Wait for connection (useful in tests)
await waitForConnection(5000); // Wait up to 5 seconds
```

### Graceful Shutdown

```typescript
import { dbDisconnect } from '@/utils/dbConnect';

// Manually disconnect (useful for cleanup)
await dbDisconnect();
```

## Model Schema

The Onboarding model includes:

```typescript
interface IOnboarding {
  brandName: string;              // Required, max 100 chars
  website: string;                // Required, must be valid URL
  crawlResult?: Record<string, unknown>;    // Optional crawl data
  analysisQueries?: Record<string, unknown>; // Optional analysis data
  createdAt: Date;                // Auto-generated
  updatedAt: Date;                // Auto-updated
}
```

## Error Handling

All database operations include comprehensive error logging:

```typescript
try {
  const result = await createOnboarding(data);
} catch (error) {
  // Errors are automatically logged with:
  // - Operation type
  // - Error details
  // - Stack trace
  console.error('Operation failed:', error);
}
```

## Performance Features

- **Connection Caching**: Prevents multiple connections in development
- **Indexes**: Optimized queries on brandName, website, and createdAt
- **Pagination**: Built-in pagination for large datasets
- **Connection Pooling**: Configurable connection pool (default: 10 connections)
- **Timeouts**: Server selection (5s) and socket (45s) timeouts

## Environment-Specific Behavior

### Development
- Detailed connection logging
- Connection state monitoring
- Automatic reconnection

### Production
- Minimal logging
- Optimized connection settings
- Graceful error handling

## Usage in Your Current App

### Update Onboarding API Route

```typescript
// src/app/api/onboarding/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createOnboarding } from '@/utils/database';
import crawl from '@/utils/crawl';
import getAnalysisQueries from '@/utils/prompts/getAnalysisQueries';

export async function POST(request: NextRequest) {
  try {
    const { brandName, website } = await request.json();
    
    // Your existing crawl logic
    const crawlResult = await crawl(website);
    const analysisQueries = await getAnalysisQueries(
      crawlResult.data[0]?.markdown, 
      website
    );
    
    // Save to database
    const onboarding = await createOnboarding({
      brandName,
      website,
      crawlResult,
      analysisQueries
    });
    
    return NextResponse.json({
      success: true,
      data: onboarding,
      message: 'Onboarding completed successfully'
    });
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
```

## Testing Database Connection

Create a simple test API route to verify your connection:

```typescript
// src/app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import dbConnect, { getConnectionState } from '@/utils/dbConnect';

export async function GET() {
  try {
    await dbConnect();
    
    return NextResponse.json({
      success: true,
      message: 'Database connected successfully',
      connectionState: getConnectionState(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        connectionState: getConnectionState()
      },
      { status: 500 }
    );
  }
}
```

Visit `/api/test-db` to test your database connection!

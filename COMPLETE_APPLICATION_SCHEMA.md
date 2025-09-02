# 🚀 Image Link Publisher - Complete Application Schema

## 📊 Database Schema (Supabase PostgreSQL)

### 1. **uploaded_images** - Core Image Storage
```sql
CREATE TABLE uploaded_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. **user_profiles** - User Management
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan_type TEXT NOT NULL DEFAULT 'free',
  images_uploaded INTEGER NOT NULL DEFAULT 0,
  images_limit INTEGER NOT NULL DEFAULT 50,
  subscription_status TEXT NOT NULL DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. **notifications** - User Notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. **user_analytics** - Event Tracking
```sql
CREATE TABLE user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. **performance_metrics** - System Monitoring
```sql
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  endpoint TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔌 API Schema (Next.js API Routes)

### Upload API - `/api/upload`
```typescript
// POST /api/upload
Request: FormData {
  files: File[],
  sessionId: string
}

Response: {
  message: string,
  results: Array<{
    filename: string,
    success: boolean,
    url: string,
    id: string
  }>,
  sessionId: string
}
```

### Image Description API - `/api/describe-image`
```typescript
// POST /api/describe-image
Request: {
  imageUrl: string,
  filename: string
}

Response: {
  description: string,
  success: boolean,
  processingTime: number
}
```

### Analytics API - `/api/analytics`
```typescript
// GET /api/analytics
Response: {
  totalImages: number,
  recentUploads: number,
  storageUsed: number,
  aiDescriptions: number
}
```

### Images API - `/api/images/[sessionId]`
```typescript
// GET /api/images/[sessionId]
Response: {
  images: Array<{
    id: string,
    filename: string,
    publicUrl: string,
    description: string,
    fileSize: number,
    createdAt: string
  }>
}
```

---

## 🎨 Component Schema (React/TypeScript)

### Core Components
```typescript
// Image Upload Component
interface ImageUploadProps {
  onFilesUploaded?: (results: UploadResult[]) => void;
}

// Image History Component  
interface ImageHistoryProps {
  userId?: string;
}

// Analytics Dashboard Component
interface AnalyticsDashboardProps {
  userId?: string;
}

// Premium Dashboard Component
interface PremiumDashboardProps {
  user: any;
  profile: UserProfile;
}

// Simple Dashboard Component
interface SimpleDashboardProps {
  user: any;
  profile: any;
}
```

### Data Types
```typescript
interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  plan_type: string;
  images_uploaded: number;
  images_limit: number;
  subscription_status: string;
}

interface UploadedImage {
  id: string;
  originalName: string;
  publicUrl: string;
  description?: string;
  fileSize: number;
  mimeType: string;
}

interface UploadResult {
  filename: string;
  success: boolean;
  url: string;
  id: string;
  sessionId?: string;
}
```

---

## 🏗️ Application Architecture

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Animations**: Framer Motion
- **Validation**: Zod schemas

### Backend Stack
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **AI**: Google Gemini 2.0 Flash Experimental
- **Fallback AI**: OpenAI GPT-4 Vision

### File Structure
```
app/
├── page.tsx                 # Landing page
├── dashboard/page.tsx       # Standard dashboard
├── simple/page.tsx         # Simple interface
├── premium/page.tsx        # Premium interface
├── auth/                   # Authentication pages
└── api/                    # API endpoints
    ├── upload/route.ts
    ├── describe-image/route.ts
    ├── analytics/route.ts
    └── images/[sessionId]/route.ts

components/
├── ui/                     # Shadcn UI components
├── image-upload.tsx        # Upload component
├── image-history.tsx       # History component
├── analytics-dashboard.tsx # Analytics component
├── premium-dashboard.tsx   # Premium interface
└── simple-dashboard.tsx    # Simple interface

lib/
├── supabase/              # Supabase client config
├── ai-premium-features.ts # AI processing logic
├── monetization-engine.ts # Subscription logic
└── performance-engine.ts  # Performance monitoring
```

---

## 🔐 Security Schema

### Row Level Security (RLS) Policies
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own images" 
  ON uploaded_images FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" 
  ON user_profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can view own notifications" 
  ON notifications FOR SELECT 
  USING (auth.uid() = user_id);
```

### Authentication Flow
1. User signs up/logs in via Supabase Auth
2. User profile automatically created via trigger
3. JWT token stored in httpOnly cookie
4. All API calls authenticated via Supabase client
5. RLS policies enforce data isolation

---

## 💰 Monetization Schema

### Subscription Tiers
```typescript
const SUBSCRIPTION_TIERS = {
  starter: {
    price: 29,
    features: ['1K images/month', 'Basic AI', 'Email support'],
    limits: { imagesPerMonth: 1000, teamMembers: 1 }
  },
  pro: {
    price: 99,
    features: ['10K images/month', 'Advanced AI', 'Team collaboration'],
    limits: { imagesPerMonth: 10000, teamMembers: 5 }
  },
  enterprise: {
    price: 499,
    features: ['Unlimited images', 'White-label', 'Custom AI'],
    limits: { imagesPerMonth: -1, teamMembers: -1 }
  }
}
```

### Revenue Streams
- Monthly subscriptions ($29-$499)
- Usage-based pricing ($0.05 per AI description)
- Premium add-ons ($19-$299)
- Enterprise custom solutions
- Marketplace commissions (30-40%)

---

## 📈 Analytics Schema

### Event Types
- `page_view` - User visits a page
- `upload_start` - User begins upload
- `upload_complete` - Upload finishes
- `ai_description` - AI generates description
- `plan_upgrade` - User upgrades subscription

### Performance Metrics
- `upload_time` - File upload duration
- `api_response` - API response time
- `ai_description_time` - AI processing time
- `page_load` - Page load performance

---

## 🚀 Deployment Schema

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
GROQ_API_KEY=xxx
OPENAI_API_KEY=xxx (fallback)
STRIPE_SECRET_KEY=xxx (for billing)
```

### Production Stack
- **Hosting**: Vercel (recommended)
- **Database**: Supabase (managed PostgreSQL)
- **Storage**: Supabase Storage (S3-compatible)
- **CDN**: Vercel Edge Network
- **Monitoring**: Built-in analytics + performance metrics

This schema supports a scalable, production-ready application with multiple revenue streams and enterprise-grade features.

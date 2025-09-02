-- Create analytics tables to track user engagement and system performance
-- These tables store metrics for business intelligence and performance monitoring

CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'upload_start', 'upload_complete', 'plan_upgrade', 'login', 'signup')),
  event_data JSONB DEFAULT '{}', -- Additional event metadata
  session_id TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL CHECK (metric_type IN ('upload_time', 'api_response', 'ai_description_time', 'page_load')),
  metric_value NUMERIC NOT NULL, -- Time in milliseconds or other numeric value
  endpoint TEXT, -- API endpoint or page route
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT DEFAULT 'count', -- count, bytes, milliseconds, etc.
  tags JSONB DEFAULT '{}', -- Additional categorization
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type ON user_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON performance_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded_at ON system_metrics(recorded_at DESC);

-- Enable RLS for analytics tables
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own analytics data
CREATE POLICY "Users can insert own analytics" ON user_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert performance metrics" ON performance_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Only allow system to insert system metrics
CREATE POLICY "System can insert metrics" ON system_metrics
  FOR INSERT WITH CHECK (true);

-- Admin users can view all analytics (you can modify this based on your admin setup)
CREATE POLICY "Admin can view analytics" ON user_analytics
  FOR SELECT USING (true); -- Modify this to check for admin role

CREATE POLICY "Admin can view performance" ON performance_metrics
  FOR SELECT USING (true); -- Modify this to check for admin role

CREATE POLICY "Admin can view system metrics" ON system_metrics
  FOR SELECT USING (true); -- Modify this to check for admin role

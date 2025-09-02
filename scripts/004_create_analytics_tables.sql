-- Create analytics and notification tables for tracking user behavior and system notifications
-- These tables support the analytics dashboard and notification center components

-- Create notifications table for user notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, success, warning, error, upload, billing, system
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user analytics table for tracking events
CREATE TABLE IF NOT EXISTS public.user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- page_view, upload_start, upload_complete, plan_upgrade, login, signup
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create performance metrics table for system monitoring
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- upload_time, api_response, ai_description_time, page_load
  metric_value NUMERIC NOT NULL, -- Time in milliseconds
  endpoint TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
CREATE POLICY "Users can view own notifications" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for analytics (read-only for users)
CREATE POLICY "Users can view own analytics" 
  ON public.user_analytics FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert analytics" 
  ON public.user_analytics FOR INSERT 
  WITH CHECK (true);

-- Create RLS policies for performance metrics (read-only for users)
CREATE POLICY "Users can view own metrics" 
  ON public.performance_metrics FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert metrics" 
  ON public.performance_metrics FOR INSERT 
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
  ON public.notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
  ON public.notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_read 
  ON public.notifications(user_id, read);

CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id 
  ON public.user_analytics(user_id);

CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type 
  ON public.user_analytics(event_type);

CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at 
  ON public.user_analytics(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id 
  ON public.performance_metrics(user_id);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_type 
  ON public.performance_metrics(metric_type);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at 
  ON public.performance_metrics(created_at DESC);

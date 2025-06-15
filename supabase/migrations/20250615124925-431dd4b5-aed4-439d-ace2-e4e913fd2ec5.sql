
-- Create a table for contributions
CREATE TABLE public.contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only manage their own contributions
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to create their own contributions
CREATE POLICY "Users can create their own contributions"
  ON public.contributions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to view their own contributions
CREATE POLICY "Users can view their own contributions"
  ON public.contributions
  FOR SELECT
  USING (auth.uid() = user_id);

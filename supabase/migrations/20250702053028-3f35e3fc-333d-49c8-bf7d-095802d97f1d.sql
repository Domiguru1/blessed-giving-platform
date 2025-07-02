-- Add contribution_type column to contributions table
ALTER TABLE public.contributions 
ADD COLUMN contribution_type TEXT NOT NULL DEFAULT 'offering' 
CHECK (contribution_type IN ('tithe', 'offering', 'sacrifice'));
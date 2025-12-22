-- Fix the SECURITY DEFINER view issue by recreating as SECURITY INVOKER
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  name,
  avatar_url,
  city,
  created_at
FROM profiles;

-- Grant access to the public view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Add RLS policy for unauthenticated/public access to view designer profile names
-- This allows the marketplace to show designer names publicly
CREATE POLICY "Anyone can view designer profile names"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM designers d 
    WHERE d.user_id = profiles.user_id 
    AND d.is_active = true
  )
);
-- Drop the overly permissive policy
DROP POLICY "Allow insert for authenticated users" ON public.notifications;

-- Create a more restrictive insert policy - only authenticated users can receive notifications
CREATE POLICY "Authenticated users can receive notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
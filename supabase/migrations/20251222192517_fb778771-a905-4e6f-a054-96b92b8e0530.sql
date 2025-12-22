-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own room designs" ON public.room_designs;
DROP POLICY IF EXISTS "Users can view their own room designs" ON public.room_designs;
DROP POLICY IF EXISTS "Users can update their own room designs" ON public.room_designs;
DROP POLICY IF EXISTS "Designers can view completed room designs" ON public.room_designs;

-- Recreate with explicit authenticated role
CREATE POLICY "Users can view their own room designs"
ON public.room_designs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own room designs"
ON public.room_designs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own room designs"
ON public.room_designs FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Designers can view completed room designs"
ON public.room_designs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM designers d 
    WHERE d.user_id = auth.uid() 
    AND d.is_active = true
  )
  AND status = 'completed'
);
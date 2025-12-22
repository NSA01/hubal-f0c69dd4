-- Update RLS policy for room_designs to allow designers to see 'open' requests
DROP POLICY IF EXISTS "Designers can view completed room designs" ON room_designs;

CREATE POLICY "Designers can view open room designs"
ON room_designs FOR SELECT
TO authenticated
USING (
  (EXISTS (
    SELECT 1 FROM designers d
    WHERE d.user_id = auth.uid() AND d.is_active = true
  ))
  AND status IN ('open', 'accepted', 'in_progress', 'completed')
);
-- Drop the existing check constraint and add a new one with all status values
ALTER TABLE room_designs DROP CONSTRAINT IF EXISTS room_designs_status_check;

ALTER TABLE room_designs ADD CONSTRAINT room_designs_status_check 
CHECK (status IN ('pending', 'generating', 'completed', 'failed', 'open', 'accepted', 'in_progress'));
-- Fix 1: Create secure send_message function to validate conversation participants
CREATE OR REPLACE FUNCTION public.send_message(
  p_conversation_id UUID,
  p_content TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_message_id UUID;
  v_customer_id UUID;
  v_designer_user_id UUID;
  v_receiver_id UUID;
BEGIN
  -- Validate content length
  IF length(p_content) < 1 OR length(p_content) > 2000 THEN
    RAISE EXCEPTION 'Message content must be between 1 and 2000 characters';
  END IF;

  -- Validate conversation exists and get participants
  SELECT c.customer_id, d.user_id 
  INTO v_customer_id, v_designer_user_id
  FROM conversations c
  JOIN designers d ON d.id = c.designer_id
  WHERE c.id = p_conversation_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conversation not found or access denied';
  END IF;
  
  -- Verify sender is a participant
  IF auth.uid() NOT IN (v_customer_id, v_designer_user_id) THEN
    RAISE EXCEPTION 'Not authorized to send messages in this conversation';
  END IF;
  
  -- Determine receiver (the other participant)
  IF auth.uid() = v_customer_id THEN
    v_receiver_id := v_designer_user_id;
  ELSE
    v_receiver_id := v_customer_id;
  END IF;
  
  -- Insert message
  INSERT INTO messages (conversation_id, sender_id, receiver_id, content)
  VALUES (p_conversation_id, auth.uid(), v_receiver_id, p_content)
  RETURNING id INTO v_message_id;
  
  -- Update conversation timestamp
  UPDATE conversations 
  SET last_message_at = now() 
  WHERE id = p_conversation_id;
  
  RETURN v_message_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.send_message TO authenticated;

-- Fix 2: Restrict profiles table to protect PII (email, phone)
-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

-- Users can always view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Users can view profiles of people in their conversations
CREATE POLICY "Users can view conversation participants profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    JOIN designers d ON d.id = c.designer_id
    WHERE 
      -- Customer viewing designer's profile
      (c.customer_id = auth.uid() AND d.user_id = profiles.user_id)
      OR
      -- Designer viewing customer's profile
      (d.user_id = auth.uid() AND c.customer_id = profiles.user_id)
  )
);

-- Designers can view customer profiles for their service requests
CREATE POLICY "Designers can view their customers profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM service_requests sr
    JOIN designers d ON d.id = sr.designer_id
    WHERE d.user_id = auth.uid()
    AND sr.customer_id = profiles.user_id
  )
);

-- Create a public view for safe profile info (name, avatar, city only)
CREATE OR REPLACE VIEW public.public_profiles AS
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
-- Security fixes migration

-- 1. Fix has_role() function: Add authorization check to prevent misuse
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow users to check their own role
  IF auth.uid() IS NULL OR auth.uid() != _user_id THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
END;
$$;

-- 2. Create secure status transition function for service requests
CREATE OR REPLACE FUNCTION public.update_request_status(
  request_id UUID,
  new_status TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_status TEXT;
  request_designer_id UUID;
  request_customer_id UUID;
  designer_user_id UUID;
BEGIN
  -- Get current request details
  SELECT status, designer_id, customer_id INTO current_status, request_designer_id, request_customer_id
  FROM service_requests WHERE id = request_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found';
  END IF;
  
  -- Get designer's user_id
  SELECT user_id INTO designer_user_id
  FROM designers WHERE id = request_designer_id;
  
  -- Validate designer authorization for accept/reject/complete
  IF new_status IN ('accepted', 'rejected', 'completed') THEN
    IF auth.uid() != designer_user_id THEN
      RAISE EXCEPTION 'Unauthorized: Only the designer can perform this action';
    END IF;
  END IF;
  
  -- Validate customer authorization for cancellation
  IF new_status = 'cancelled' THEN
    IF auth.uid() != request_customer_id THEN
      RAISE EXCEPTION 'Unauthorized: Only the customer can cancel';
    END IF;
  END IF;
  
  -- Validate status transitions
  IF current_status = 'pending' AND new_status NOT IN ('accepted', 'rejected', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status transition from pending';
  END IF;
  
  IF current_status = 'accepted' AND new_status NOT IN ('completed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status transition from accepted';
  END IF;
  
  IF current_status IN ('completed', 'rejected', 'cancelled') THEN
    RAISE EXCEPTION 'Cannot update finalized requests';
  END IF;
  
  -- Update status
  UPDATE service_requests SET status = new_status, updated_at = now()
  WHERE id = request_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.update_request_status TO authenticated;

-- 3. Add database constraints for data integrity (defense in depth)
ALTER TABLE service_requests DROP CONSTRAINT IF EXISTS check_budget_positive;
ALTER TABLE service_requests ADD CONSTRAINT check_budget_positive CHECK (budget > 0 AND budget < 100000000);

ALTER TABLE service_requests DROP CONSTRAINT IF EXISTS check_description_length;
ALTER TABLE service_requests ADD CONSTRAINT check_description_length CHECK (description IS NULL OR char_length(description) <= 2000);

ALTER TABLE messages DROP CONSTRAINT IF EXISTS check_content_length;
ALTER TABLE messages ADD CONSTRAINT check_content_length CHECK (char_length(content) > 0 AND char_length(content) <= 5000);

ALTER TABLE designers DROP CONSTRAINT IF EXISTS check_budget_order;
ALTER TABLE designers ADD CONSTRAINT check_budget_order CHECK (min_budget IS NULL OR max_budget IS NULL OR min_budget <= max_budget);

-- 4. Add unique constraint to prevent duplicate reviews
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS unique_customer_designer_review;
ALTER TABLE reviews ADD CONSTRAINT unique_customer_designer_review UNIQUE (customer_id, designer_id);

-- 5. Create rate limiting function for service requests
CREATE OR REPLACE FUNCTION public.check_request_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Check requests in last hour
  SELECT COUNT(*) INTO recent_count
  FROM service_requests
  WHERE customer_id = NEW.customer_id
  AND created_at > now() - interval '1 hour';
  
  IF recent_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 10 requests per hour';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for rate limiting
DROP TRIGGER IF EXISTS enforce_request_rate_limit ON service_requests;
CREATE TRIGGER enforce_request_rate_limit
BEFORE INSERT ON service_requests
FOR EACH ROW
EXECUTE FUNCTION public.check_request_rate_limit();

-- 6. Create rate limiting function for messages
CREATE OR REPLACE FUNCTION public.check_message_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Check messages in last minute
  SELECT COUNT(*) INTO recent_count
  FROM messages
  WHERE sender_id = NEW.sender_id
  AND created_at > now() - interval '1 minute';
  
  IF recent_count >= 30 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 30 messages per minute';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for message rate limiting
DROP TRIGGER IF EXISTS enforce_message_rate_limit ON messages;
CREATE TRIGGER enforce_message_rate_limit
BEFORE INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION public.check_message_rate_limit();
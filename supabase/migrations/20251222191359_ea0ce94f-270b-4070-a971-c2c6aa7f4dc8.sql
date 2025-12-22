-- Create room_designs table for AI-generated room designs
CREATE TABLE public.room_designs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_image_url TEXT NOT NULL,
  generated_image_url TEXT,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create design_offers table for designer bids
CREATE TABLE public.design_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_design_id UUID NOT NULL REFERENCES public.room_designs(id) ON DELETE CASCADE,
  designer_id UUID NOT NULL REFERENCES public.designers(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL CHECK (price > 0),
  message TEXT,
  estimated_days INTEGER CHECK (estimated_days > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_design_id, designer_id)
);

-- Enable RLS
ALTER TABLE public.room_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_offers ENABLE ROW LEVEL SECURITY;

-- RLS policies for room_designs
CREATE POLICY "Users can view their own room designs"
ON public.room_designs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own room designs"
ON public.room_designs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own room designs"
ON public.room_designs FOR UPDATE
USING (auth.uid() = user_id);

-- Designers can view all completed room designs to make offers
CREATE POLICY "Designers can view completed room designs"
ON public.room_designs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM designers d 
    WHERE d.user_id = auth.uid() 
    AND d.is_active = true
  )
  AND status = 'completed'
);

-- RLS policies for design_offers
CREATE POLICY "Users can view offers for their designs"
ON public.design_offers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM room_designs rd 
    WHERE rd.id = room_design_id 
    AND rd.user_id = auth.uid()
  )
);

CREATE POLICY "Designers can view their own offers"
ON public.design_offers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM designers d 
    WHERE d.id = designer_id 
    AND d.user_id = auth.uid()
  )
);

CREATE POLICY "Designers can create offers"
ON public.design_offers FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM designers d 
    WHERE d.id = designer_id 
    AND d.user_id = auth.uid()
    AND d.is_active = true
  )
);

CREATE POLICY "Designers can update their own pending offers"
ON public.design_offers FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM designers d 
    WHERE d.id = designer_id 
    AND d.user_id = auth.uid()
  )
  AND status = 'pending'
);

CREATE POLICY "Users can update offers on their designs"
ON public.design_offers FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM room_designs rd 
    WHERE rd.id = room_design_id 
    AND rd.user_id = auth.uid()
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_room_designs_updated_at
BEFORE UPDATE ON public.room_designs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_design_offers_updated_at
BEFORE UPDATE ON public.design_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
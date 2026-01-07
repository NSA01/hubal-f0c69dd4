-- Allow customers to update their own reviews
CREATE POLICY "Customers can update their own reviews"
ON public.reviews
FOR UPDATE
USING (auth.uid() = customer_id)
WITH CHECK (auth.uid() = customer_id);
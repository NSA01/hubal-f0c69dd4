-- Add foreign key from designers to profiles
ALTER TABLE public.designers
ADD CONSTRAINT designers_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key from service_requests to profiles (customer)
ALTER TABLE public.service_requests
ADD CONSTRAINT service_requests_customer_id_profiles_fkey 
FOREIGN KEY (customer_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key from reviews to profiles (customer)
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_customer_id_profiles_fkey 
FOREIGN KEY (customer_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
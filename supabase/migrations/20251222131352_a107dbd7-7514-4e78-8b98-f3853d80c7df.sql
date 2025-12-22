-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('customer', 'designer');

-- Create user roles table (for secure role management)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    city TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create designers table
CREATE TABLE public.designers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    business_name TEXT,
    bio TEXT,
    city TEXT NOT NULL DEFAULT 'الرياض',
    min_budget NUMERIC DEFAULT 5000,
    max_budget NUMERIC DEFAULT 50000,
    services TEXT[] DEFAULT ARRAY['تصميم داخلي كامل']::TEXT[],
    portfolio_images TEXT[] DEFAULT ARRAY[]::TEXT[],
    rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on designers
ALTER TABLE public.designers ENABLE ROW LEVEL SECURITY;

-- RLS policies for designers
CREATE POLICY "Designers are viewable by everyone"
ON public.designers
FOR SELECT
USING (true);

CREATE POLICY "Designers can update their own profile"
ON public.designers
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Designers can insert their own profile"
ON public.designers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS policy for categories (public read)
CREATE POLICY "Categories are viewable by everyone"
ON public.categories
FOR SELECT
USING (true);

-- Insert default category
INSERT INTO public.categories (name, name_ar, description, icon)
VALUES ('interior_design', 'التصميم الداخلي', 'خدمات التصميم الداخلي للمنازل والمكاتب', 'home');

-- Create service_requests table
CREATE TABLE public.service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    designer_id UUID REFERENCES public.designers(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id),
    property_type TEXT NOT NULL,
    city TEXT NOT NULL,
    budget NUMERIC NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on service_requests
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_requests
CREATE POLICY "Customers can view their own requests"
ON public.service_requests
FOR SELECT
USING (auth.uid() = customer_id);

CREATE POLICY "Designers can view requests sent to them"
ON public.service_requests
FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.designers d 
    WHERE d.id = designer_id AND d.user_id = auth.uid()
));

CREATE POLICY "Customers can create requests"
ON public.service_requests
FOR INSERT
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Designers can update requests sent to them"
ON public.service_requests
FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM public.designers d 
    WHERE d.id = designer_id AND d.user_id = auth.uid()
));

-- Create reviews table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    designer_id UUID REFERENCES public.designers(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    service_request_id UUID REFERENCES public.service_requests(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for reviews
CREATE POLICY "Reviews are viewable by everyone"
ON public.reviews
FOR SELECT
USING (true);

CREATE POLICY "Customers can create reviews"
ON public.reviews
FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- Function to update designer rating
CREATE OR REPLACE FUNCTION public.update_designer_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.designers
    SET 
        rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE designer_id = NEW.designer_id),
        review_count = (SELECT COUNT(*) FROM public.reviews WHERE designer_id = NEW.designer_id),
        updated_at = now()
    WHERE id = NEW.designer_id;
    RETURN NEW;
END;
$$;

-- Trigger to update rating on new review
CREATE TRIGGER on_review_created
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_designer_rating();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_designers_updated_at
BEFORE UPDATE ON public.designers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
BEFORE UPDATE ON public.service_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
        NEW.email
    );
    RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
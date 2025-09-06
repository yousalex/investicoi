-- Create enum for user plans
CREATE TYPE public.user_plan AS ENUM ('free', 'basic', 'premium');

-- Create profiles table for additional user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  plan public.user_plan NOT NULL DEFAULT 'free',
  plan_expires_at TIMESTAMP WITH TIME ZONE,
  daily_usage_count INTEGER NOT NULL DEFAULT 0,
  last_usage_reset TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles  
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create usage limits table
CREATE TABLE public.plan_limits (
  plan public.user_plan PRIMARY KEY,
  daily_usage_limit INTEGER NOT NULL,
  price_monthly DECIMAL(10,2),
  description TEXT
);

-- Insert plan limits
INSERT INTO public.plan_limits (plan, daily_usage_limit, price_monthly, description) VALUES
  ('free', 4, 0.00, 'Free plan with 4 daily uses'),
  ('basic', 20, 9.99, 'Basic plan with 20 daily uses'),
  ('premium', 100, 19.99, 'Premium plan with 100 daily uses');

-- Create trigger function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to reset daily usage
CREATE OR REPLACE FUNCTION public.reset_daily_usage()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    daily_usage_count = 0,
    last_usage_reset = now()
  WHERE last_usage_reset < now() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check and increment usage
CREATE OR REPLACE FUNCTION public.increment_usage(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_usage INTEGER;
  usage_limit INTEGER;
  user_plan public.user_plan;
BEGIN
  -- Reset usage if 24 hours have passed
  PERFORM public.reset_daily_usage();
  
  -- Get current usage and plan
  SELECT daily_usage_count, plan INTO current_usage, user_plan
  FROM public.profiles WHERE id = user_id;
  
  -- Get usage limit for plan
  SELECT daily_usage_limit INTO usage_limit
  FROM public.plan_limits WHERE plan = user_plan;
  
  -- Check if user has uses remaining
  IF current_usage >= usage_limit THEN
    RETURN FALSE;
  END IF;
  
  -- Increment usage
  UPDATE public.profiles 
  SET daily_usage_count = daily_usage_count + 1
  WHERE id = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
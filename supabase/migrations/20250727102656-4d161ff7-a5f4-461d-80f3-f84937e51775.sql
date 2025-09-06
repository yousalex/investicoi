-- Fix function search paths
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.reset_daily_usage()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    daily_usage_count = 0,
    last_usage_reset = now()
  WHERE last_usage_reset < now() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Enable RLS on plan_limits table
ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read plan limits
CREATE POLICY "Plan limits are viewable by everyone" ON public.plan_limits
  FOR SELECT USING (true);
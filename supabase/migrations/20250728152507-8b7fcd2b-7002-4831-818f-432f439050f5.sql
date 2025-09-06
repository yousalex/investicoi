-- Update the plan_limits table with new pricing structure
DELETE FROM public.plan_limits;

-- Insert new plan limits with updated pricing
INSERT INTO public.plan_limits (plan, daily_usage_limit, price_monthly, description) VALUES
  ('gratuito', 4, 0.00, 'Plan gratuito con 4 usos diarios'),
  ('mensual', 20, 1.65, 'Plan mensual - 1 mes por $1.65 USD'),
  ('trimestral', 50, 4.21, 'Plan trimestral - 3 meses por $4.21 USD'),
  ('semestral', 100, 7.92, 'Plan semestral - 6 meses por $7.92 USD'),
  ('anual', 200, 14.85, 'Plan anual - 12 meses por $14.85 USD');

-- Update the increment_usage function to work with new plan types
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
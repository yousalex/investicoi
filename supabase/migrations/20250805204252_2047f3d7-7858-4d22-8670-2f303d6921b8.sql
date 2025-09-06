-- Update the increment_usage function to check for plan expiration
CREATE OR REPLACE FUNCTION public.increment_usage(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  current_usage INTEGER;
  usage_limit INTEGER;
  user_plan public.user_plan;
  plan_expiration TIMESTAMPTZ;
BEGIN
  -- Reset usage if 24 hours have passed
  PERFORM public.reset_daily_usage();
  
  -- Get current usage, plan, and expiration
  SELECT daily_usage_count, plan, plan_expires_at 
  INTO current_usage, user_plan, plan_expiration
  FROM public.profiles WHERE id = user_id;
  
  -- Check if plan has expired and reset to free if needed
  IF plan_expiration IS NOT NULL AND plan_expiration < now() THEN
    UPDATE public.profiles 
    SET 
      plan = 'gratuito',
      plan_expires_at = NULL,
      daily_usage_count = 0,
      last_usage_reset = now(),
      updated_at = now()
    WHERE id = user_id;
    
    -- Update local variables
    user_plan := 'gratuito';
    current_usage := 0;
  END IF;
  
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
$function$;
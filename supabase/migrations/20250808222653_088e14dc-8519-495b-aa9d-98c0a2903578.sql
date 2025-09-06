-- Update the free plan limit to 2 uses
UPDATE public.plan_limits 
SET daily_usage_limit = 2 
WHERE plan = 'gratuito';
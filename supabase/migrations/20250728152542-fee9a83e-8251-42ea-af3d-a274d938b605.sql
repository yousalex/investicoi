-- Drop and recreate the plan_limits table
DROP TABLE IF EXISTS public.plan_limits CASCADE;

CREATE TABLE public.plan_limits (
  plan public.user_plan PRIMARY KEY,
  daily_usage_limit INTEGER NOT NULL,
  price_monthly DECIMAL(10,2),
  description TEXT
);

-- Enable RLS on plan_limits table
ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read plan limits
CREATE POLICY "Plan limits are viewable by everyone" ON public.plan_limits
  FOR SELECT USING (true);

-- Insert new plan limits with updated pricing
INSERT INTO public.plan_limits (plan, daily_usage_limit, price_monthly, description) VALUES
  ('gratuito', 4, 0.00, 'Plan gratuito con 4 usos diarios'),
  ('mensual', 20, 1.65, 'Plan mensual - 1 mes por $1.65 USD'),
  ('trimestral', 50, 4.21, 'Plan trimestral - 3 meses por $4.21 USD'),
  ('semestral', 100, 7.92, 'Plan semestral - 6 meses por $7.92 USD'),
  ('anual', 200, 14.85, 'Plan anual - 12 meses por $14.85 USD');
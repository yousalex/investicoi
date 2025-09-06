-- Create new enum type
CREATE TYPE public.new_user_plan AS ENUM ('gratuito', 'mensual', 'trimestral', 'semestral', 'anual');

-- Add temporary column with new type
ALTER TABLE public.profiles ADD COLUMN temp_plan public.new_user_plan DEFAULT 'gratuito';

-- Update the new column based on existing data
UPDATE public.profiles SET temp_plan = 
  CASE 
    WHEN plan::text = 'free' THEN 'gratuito'::public.new_user_plan
    WHEN plan::text = 'basic' THEN 'mensual'::public.new_user_plan  
    WHEN plan::text = 'premium' THEN 'anual'::public.new_user_plan
    ELSE 'gratuito'::public.new_user_plan
  END;

-- Drop the old column constraints and column
ALTER TABLE public.profiles DROP COLUMN plan;

-- Rename temp column to plan
ALTER TABLE public.profiles RENAME COLUMN temp_plan TO plan;

-- Drop old type and rename new one
DROP TYPE IF EXISTS public.user_plan CASCADE;
ALTER TYPE public.new_user_plan RENAME TO user_plan;
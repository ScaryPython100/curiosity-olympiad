-- 1. Create a function that automatically inserts into student_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the new user into student_profiles, extracting their username and real_name from metadata
  INSERT INTO public.student_profiles (id, username, real_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Explorer'),
    COALESCE(NEW.raw_user_meta_data->>'real_name', 'Student')
  )
  ON CONFLICT (id) DO UPDATE SET 
    username = EXCLUDED.username,
    real_name = EXCLUDED.real_name;
    
  -- Also initialize their gamification data
  INSERT INTO public.user_gamification (id, user_id, xp, curiosity_points)
  VALUES (NEW.id, NEW.id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

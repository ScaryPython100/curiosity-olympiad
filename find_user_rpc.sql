CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email text)
RETURNS uuid AS $$
BEGIN
  RETURN (SELECT id FROM auth.users WHERE email = user_email LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_id_by_phone(user_phone text)
RETURNS uuid AS $$
BEGIN
  RETURN (SELECT id FROM auth.users WHERE phone = user_phone LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

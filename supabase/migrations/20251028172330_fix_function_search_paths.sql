/*
  # Fix Function Search Paths

  ## Problem
  - 3 functions have mutable search paths
  - Vulnerable to search path manipulation attacks
  
  ## Solution
  - Drop and recreate with SET search_path
  - Prevents SQL injection via search path
*/

-- Fix update_bounty_phases_updated_at
DROP FUNCTION IF EXISTS update_bounty_phases_updated_at() CASCADE;
CREATE FUNCTION update_bounty_phases_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate triggers that were dropped with CASCADE
CREATE TRIGGER bounty_phases_updated_at
  BEFORE UPDATE ON bounty_phases
  FOR EACH ROW
  EXECUTE FUNCTION update_bounty_phases_updated_at();

CREATE TRIGGER phase_submissions_updated_at
  BEFORE UPDATE ON phase_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_bounty_phases_updated_at();

-- Fix get_unread_count
DROP FUNCTION IF EXISTS get_unread_count(uuid);
CREATE FUNCTION get_unread_count(user_id uuid)
RETURNS bigint
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE notifications.user_id = get_unread_count.user_id AND read = false
  );
END;
$$;

-- Fix mark_all_notifications_read
DROP FUNCTION IF EXISTS mark_all_notifications_read(uuid);
CREATE FUNCTION mark_all_notifications_read(user_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE notifications
  SET read = true
  WHERE notifications.user_id = mark_all_notifications_read.user_id AND read = false;
END;
$$;

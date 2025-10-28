/*
  # Create Notifications System

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text) - bounty_created, submission_received, winner_selected, etc
      - `title` (text)
      - `message` (text)
      - `data` (jsonb) - metadata específica del evento
      - `read` (boolean) - si fue leída
      - `action_url` (text) - URL para navegar al hacer click
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on notifications table
    - Users can only read their own notifications
    - System can insert notifications for any user
  
  3. Indexes
    - Index on user_id for fast lookups
    - Index on read status for unread count
    - Index on created_at for sorting
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id::text = current_setting('request.jwt.claim.sub', true));

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id::text = current_setting('request.jwt.claim.sub', true))
  WITH CHECK (user_id::text = current_setting('request.jwt.claim.sub', true));

-- Policy: System can insert notifications (using service role)
CREATE POLICY "Service can insert notifications"
  ON notifications FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Create function to count unread notifications
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::integer
  FROM notifications
  WHERE user_id = p_user_id AND read = false;
$$;

-- Create function to mark all as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE notifications
  SET read = true
  WHERE user_id = p_user_id AND read = false;
$$;

-- Add comment
COMMENT ON TABLE notifications IS 'Stores user notifications for real-time updates';

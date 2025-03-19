/*
  # Initial Schema Setup

  1. Tables
    - profiles
      - id (uuid, references auth.users)
      - created_at (timestamp)
      - updated_at (timestamp)
      - email (text)
    - locations
      - id (uuid)
      - created_at (timestamp)
      - name (text)
      - map_url (text)
    - antennas
      - id (uuid)
      - created_at (timestamp)
      - location_id (uuid, references locations)
      - name (text)
      - position_x (float)
      - position_y (float)
    - sensors
      - id (uuid)
      - created_at (timestamp)
      - location_id (uuid, references locations)
      - name (text)
      - type (text)
      - position_x (float)
      - position_y (float)
    - readings
      - id (uuid)
      - created_at (timestamp)
      - antenna_id (uuid, references antennas)
      - sensor_id (uuid, references sensors)
      - value (jsonb)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  email text,
  PRIMARY KEY (id)
);

-- Create locations table
CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  map_url text
);

-- Create antennas table
CREATE TABLE antennas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  location_id uuid REFERENCES locations ON DELETE CASCADE,
  name text NOT NULL,
  position_x float NOT NULL,
  position_y float NOT NULL
);

-- Create sensors table
CREATE TABLE sensors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  location_id uuid REFERENCES locations ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  position_x float NOT NULL,
  position_y float NOT NULL
);

-- Create readings table
CREATE TABLE readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  antenna_id uuid REFERENCES antennas ON DELETE CASCADE,
  sensor_id uuid REFERENCES sensors ON DELETE CASCADE,
  value jsonb NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE antennas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view all locations"
  ON locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create locations"
  ON locations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view all antennas"
  ON antennas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create antennas"
  ON antennas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view all sensors"
  ON sensors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create sensors"
  ON sensors FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view all readings"
  ON readings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create readings"
  ON readings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to handle profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
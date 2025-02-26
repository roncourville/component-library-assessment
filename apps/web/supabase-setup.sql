-- Create plasmids table
CREATE TABLE public.plasmids (
    id VARCHAR(255) PRIMARY KEY,
    plasmid_name VARCHAR(255) NOT NULL,
    volume_ul NUMERIC(10, 2) NOT NULL,
    length_bp INTEGER NOT NULL,
    storage_location VARCHAR(255) NOT NULL,
    assignees JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create users table
CREATE TABLE public.users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    image VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster searches
CREATE INDEX idx_plasmids_plasmid_name ON public.plasmids (plasmid_name);
CREATE INDEX idx_users_name ON public.users (name);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_plasmids_updated_at
BEFORE UPDATE ON public.plasmids
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Insert sample users
INSERT INTO public.users (id, name, email, image) VALUES
('user-1', 'John Smith', 'john.smith@example.com', 'https://randomuser.me/api/portraits/men/1.jpg'),
('user-2', 'Emily Johnson', 'emily.johnson@example.com', 'https://randomuser.me/api/portraits/women/2.jpg'),
('user-3', 'Michael Brown', 'michael.brown@example.com', 'https://randomuser.me/api/portraits/men/3.jpg'),
('user-4', 'Sarah Davis', 'sarah.davis@example.com', 'https://randomuser.me/api/portraits/women/4.jpg'),
('user-5', 'David Wilson', 'david.wilson@example.com', 'https://randomuser.me/api/portraits/men/5.jpg'),
('user-6', 'Jessica Taylor', 'jessica.taylor@example.com', 'https://randomuser.me/api/portraits/women/6.jpg'),
('user-7', 'Robert Martinez', 'robert.martinez@example.com', 'https://randomuser.me/api/portraits/men/7.jpg'),
('user-8', 'Jennifer Anderson', 'jennifer.anderson@example.com', 'https://randomuser.me/api/portraits/women/8.jpg'),
('user-9', 'Christopher Thomas', 'christopher.thomas@example.com', 'https://randomuser.me/api/portraits/men/9.jpg'),
('user-10', 'Lisa Jackson', 'lisa.jackson@example.com', 'https://randomuser.me/api/portraits/women/10.jpg');

-- Insert sample plasmids with assignees
INSERT INTO public.plasmids (id, plasmid_name, volume_ul, length_bp, storage_location, assignees) VALUES
('inv-GT-plasmid-1', 'GT-plasmids-1: lentiCRISPR v2', 50.00, 14873, 'Freezer 2 Box A1', 
 '[{"id":"user-1","name":"John Smith","email":"john.smith@example.com","image":"https://randomuser.me/api/portraits/men/1.jpg"},
   {"id":"user-2","name":"Emily Johnson","email":"emily.johnson@example.com","image":"https://randomuser.me/api/portraits/women/2.jpg"}]'),
   
('inv-GT-plasmid-2', 'GT-plasmids-2: psPAX2', 75.50, 10703, 'Freezer 2 Box A2', 
 '[{"id":"user-3","name":"Michael Brown","email":"michael.brown@example.com","image":"https://randomuser.me/api/portraits/men/3.jpg"}]'),
 
('inv-GT-plasmid-3', 'GT-plasmids-3: pMD2.G', 100.25, 5824, 'Freezer 2 Box A3', 
 '[{"id":"user-4","name":"Sarah Davis","email":"sarah.davis@example.com","image":"https://randomuser.me/api/portraits/women/4.jpg"},
   {"id":"user-5","name":"David Wilson","email":"david.wilson@example.com","image":"https://randomuser.me/api/portraits/men/5.jpg"},
   {"id":"user-6","name":"Jessica Taylor","email":"jessica.taylor@example.com","image":"https://randomuser.me/api/portraits/women/6.jpg"}]'),
   
('inv-GT-plasmid-4', 'GT-plasmids-4: CRISPRoff-v2.1', 45.75, 12500, 'Freezer 2 Box B1', 
 '[{"id":"user-7","name":"Robert Martinez","email":"robert.martinez@example.com","image":"https://randomuser.me/api/portraits/men/7.jpg"}]'),
 
('inv-GT-plasmid-5', 'GT-plasmids-5: pLKO.1', 60.00, 7032, 'Freezer 2 Box B2', 
 '[{"id":"user-8","name":"Jennifer Anderson","email":"jennifer.anderson@example.com","image":"https://randomuser.me/api/portraits/women/8.jpg"},
   {"id":"user-9","name":"Christopher Thomas","email":"christopher.thomas@example.com","image":"https://randomuser.me/api/portraits/men/9.jpg"}]'),
   
('inv-GT-plasmid-6', 'GT-plasmids-6: pLJM1', 85.25, 8921, 'Freezer 2 Box B3', 
 '[{"id":"user-10","name":"Lisa Jackson","email":"lisa.jackson@example.com","image":"https://randomuser.me/api/portraits/women/10.jpg"}]'),
 
('inv-GT-plasmid-7', 'GT-plasmids-7: pX330', 55.50, 8484, 'Freezer 3 Box A1', 
 '[{"id":"user-1","name":"John Smith","email":"john.smith@example.com","image":"https://randomuser.me/api/portraits/men/1.jpg"},
   {"id":"user-3","name":"Michael Brown","email":"michael.brown@example.com","image":"https://randomuser.me/api/portraits/men/3.jpg"},
   {"id":"user-5","name":"David Wilson","email":"david.wilson@example.com","image":"https://randomuser.me/api/portraits/men/5.jpg"}]'),
   
('inv-GT-plasmid-8', 'GT-plasmids-8: pX458', 70.75, 9272, 'Freezer 3 Box A2', 
 '[{"id":"user-2","name":"Emily Johnson","email":"emily.johnson@example.com","image":"https://randomuser.me/api/portraits/women/2.jpg"},
   {"id":"user-4","name":"Sarah Davis","email":"sarah.davis@example.com","image":"https://randomuser.me/api/portraits/women/4.jpg"}]'),
   
('inv-GT-plasmid-9', 'GT-plasmids-9: pLenti-CRISPR', 90.00, 13500, 'Freezer 3 Box A3', 
 '[{"id":"user-6","name":"Jessica Taylor","email":"jessica.taylor@example.com","image":"https://randomuser.me/api/portraits/women/6.jpg"},
   {"id":"user-8","name":"Jennifer Anderson","email":"jennifer.anderson@example.com","image":"https://randomuser.me/api/portraits/women/8.jpg"},
   {"id":"user-10","name":"Lisa Jackson","email":"lisa.jackson@example.com","image":"https://randomuser.me/api/portraits/women/10.jpg"}]'),
   
('inv-GT-plasmid-10', 'GT-plasmids-10: pAAV-CRISPR', 65.25, 7500, 'Freezer 3 Box B1', 
 '[{"id":"user-7","name":"Robert Martinez","email":"robert.martinez@example.com","image":"https://randomuser.me/api/portraits/men/7.jpg"},
   {"id":"user-9","name":"Christopher Thomas","email":"christopher.thomas@example.com","image":"https://randomuser.me/api/portraits/men/9.jpg"}]');

-- Create RLS policies for secure access
ALTER TABLE public.plasmids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read all plasmids
CREATE POLICY "Allow authenticated users to read plasmids"
ON public.plasmids FOR SELECT
TO authenticated
USING (true);

-- Create policy for authenticated users to insert their own plasmids
CREATE POLICY "Allow authenticated users to insert plasmids"
ON public.plasmids FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy for authenticated users to update their own plasmids
CREATE POLICY "Allow authenticated users to update plasmids"
ON public.plasmids FOR UPDATE
TO authenticated
USING (true);

-- Create policy for authenticated users to delete their own plasmids
CREATE POLICY "Allow authenticated users to delete plasmids"
ON public.plasmids FOR DELETE
TO authenticated
USING (true);

-- Similar policies for users table
CREATE POLICY "Allow authenticated users to read users"
ON public.users FOR SELECT
TO authenticated
USING (true);

-- Create function to handle search
CREATE OR REPLACE FUNCTION search_plasmids(search_term TEXT)
RETURNS SETOF public.plasmids AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.plasmids
  WHERE 
    plasmid_name ILIKE '%' || search_term || '%' OR
    storage_location ILIKE '%' || search_term || '%' OR
    id ILIKE '%' || search_term || '%';
END;
$$ LANGUAGE plpgsql;


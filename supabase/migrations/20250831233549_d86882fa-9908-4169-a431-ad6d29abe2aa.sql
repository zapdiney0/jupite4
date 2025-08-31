-- Create shipments table
CREATE TABLE public.shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT NOT NULL UNIQUE,
  sender_name TEXT NOT NULL,
  sender_address TEXT NOT NULL,
  sender_phone TEXT,
  recipient_name TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  recipient_phone TEXT,
  package_description TEXT,
  weight DECIMAL(10,2),
  dimensions TEXT,
  service_type TEXT NOT NULL DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'pending',
  origin_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  estimated_delivery DATE,
  actual_delivery DATE,
  shipping_cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create status history table for tracking updates
CREATE TABLE public.shipment_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  location TEXT,
  description TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for shipments (public read for tracking, admin full access)
CREATE POLICY "Anyone can view shipments for tracking" 
ON public.shipments 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage shipments" 
ON public.shipments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create policies for shipment status history
CREATE POLICY "Anyone can view status history" 
ON public.shipment_status_history 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage status history" 
ON public.shipment_status_history 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    CASE 
      WHEN NEW.email = 'admin@shipping.com' THEN 'admin'
      ELSE 'customer'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
INSERT INTO public.shipments (tracking_number, sender_name, sender_address, sender_phone, recipient_name, recipient_address, recipient_phone, package_description, weight, service_type, status, origin_city, destination_city, estimated_delivery, shipping_cost) VALUES
('SH001234567', 'John Smith', '123 Main St, New York, NY 10001', '+1-555-0123', 'Jane Doe', '456 Oak Ave, Los Angeles, CA 90210', '+1-555-0456', 'Electronics package', 2.5, 'express', 'in_transit', 'New York', 'Los Angeles', '2024-02-15', 45.99),
('SH001234568', 'Alice Johnson', '789 Pine St, Chicago, IL 60601', '+1-555-0789', 'Bob Wilson', '321 Elm St, Miami, FL 33101', '+1-555-0321', 'Documents', 0.5, 'standard', 'delivered', 'Chicago', 'Miami', '2024-02-10', 15.99),
('SH001234569', 'Carol Brown', '555 Maple Dr, Seattle, WA 98101', '+1-555-0555', 'Dave Miller', '777 Cedar Ln, Austin, TX 73301', '+1-555-0777', 'Clothing package', 1.8, 'express', 'pending', 'Seattle', 'Austin', '2024-02-20', 32.50);

-- Insert status history for tracking
INSERT INTO public.shipment_status_history (shipment_id, status, location, description) VALUES
((SELECT id FROM public.shipments WHERE tracking_number = 'SH001234567'), 'pending', 'New York Hub', 'Package received and processed'),
((SELECT id FROM public.shipments WHERE tracking_number = 'SH001234567'), 'in_transit', 'Denver Hub', 'Package in transit to destination'),
((SELECT id FROM public.shipments WHERE tracking_number = 'SH001234568'), 'pending', 'Chicago Hub', 'Package received and processed'),
((SELECT id FROM public.shipments WHERE tracking_number = 'SH001234568'), 'in_transit', 'Atlanta Hub', 'Package in transit to destination'),
((SELECT id FROM public.shipments WHERE tracking_number = 'SH001234568'), 'delivered', 'Miami', 'Package delivered successfully'),
((SELECT id FROM public.shipments WHERE tracking_number = 'SH001234569'), 'pending', 'Seattle Hub', 'Package received and processed');
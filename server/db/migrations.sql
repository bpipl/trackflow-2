-- Migration script for Track Flow Courier application
-- Use this script to set up the initial database schema in Railway PostgreSQL

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users and Authentication tables
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255),
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  permission VARCHAR(100) NOT NULL,
  value BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, permission)
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  mobile VARCHAR(20) NOT NULL,
  mobile2 VARCHAR(20),
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  landmark VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  preferred_courier UUID,
  default_to_pay_shipping BOOLEAN DEFAULT false,
  notes TEXT,
  preferred_shipment_method VARCHAR(10),
  preferred_print_type VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courier Partners table
CREATE TABLE IF NOT EXISTS couriers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  prefix VARCHAR(20) NOT NULL,
  starting_tracking_number INTEGER NOT NULL,
  current_tracking_number INTEGER NOT NULL,
  end_tracking_number INTEGER NOT NULL,
  air_charge DECIMAL(10, 2) NOT NULL,
  surface_charge DECIMAL(10, 2) NOT NULL,
  is_custom_courier BOOLEAN DEFAULT false,
  default_shipment_method VARCHAR(10),
  default_print_type VARCHAR(10),
  express_prefix VARCHAR(20),
  express_starting_tracking_number INTEGER,
  express_current_tracking_number INTEGER,
  express_end_tracking_number INTEGER,
  express_air_charge DECIMAL(10, 2),
  express_surface_charge DECIMAL(10, 2),
  is_express_master_toggle BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sender Addresses table
CREATE TABLE IF NOT EXISTS sender_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  mobile VARCHAR(20),
  mobile2 VARCHAR(20),
  gst_number VARCHAR(20),
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  landmark VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courier Slips table
CREATE TABLE IF NOT EXISTS slips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_id VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_address TEXT NOT NULL,
  customer_mobile VARCHAR(20) NOT NULL,
  courier_id UUID REFERENCES couriers(id),
  courier_name VARCHAR(255) NOT NULL,
  sender_address_id UUID REFERENCES sender_addresses(id),
  sender_name VARCHAR(255) NOT NULL,
  sender_address TEXT NOT NULL,
  method VARCHAR(10) NOT NULL CHECK (method IN ('air', 'surface')),
  weight DECIMAL(10, 2),
  number_of_boxes INTEGER DEFAULT 1,
  box_weights JSONB,
  weighed_at TIMESTAMP,
  weighed_by VARCHAR(255),
  generated_by VARCHAR(255) NOT NULL,
  generated_at TIMESTAMP NOT NULL,
  charges DECIMAL(10, 2) NOT NULL,
  email_sent BOOLEAN DEFAULT false,
  is_cancelled BOOLEAN DEFAULT false,
  is_to_pay_shipping BOOLEAN DEFAULT false,
  is_packed BOOLEAN DEFAULT false,
  packed_at TIMESTAMP,
  packed_by VARCHAR(255),
  is_express_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMP NOT NULL,
  user_id VARCHAR(255),
  username VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WhatsApp Settings table
CREATE TABLE IF NOT EXISTS whatsapp_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auto_send_delay INTEGER NOT NULL DEFAULT 3,
  enable_auto_send BOOLEAN DEFAULT false,
  message_template TEXT NOT NULL,
  start_sending_time VARCHAR(10) NOT NULL DEFAULT '10:00',
  send_delay_between_customers INTEGER NOT NULL DEFAULT 60,
  allow_manual_override BOOLEAN DEFAULT true,
  enable_batch_summary BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  html TEXT NOT NULL,
  css TEXT,
  json JSONB,
  courier_type VARCHAR(50),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports table for saved reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  filters JSONB,
  created_by UUID REFERENCES users(id),
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_slips_tracking_id ON slips(tracking_id);
CREATE INDEX IF NOT EXISTS idx_slips_customer_id ON slips(customer_id);
CREATE INDEX IF NOT EXISTS idx_slips_courier_id ON slips(courier_id);
CREATE INDEX IF NOT EXISTS idx_slips_is_express_mode ON slips(is_express_mode);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_username ON audit_logs(username);
CREATE INDEX IF NOT EXISTS idx_templates_courier_type ON templates(courier_type);

-- Insert demo admin user (password would be hashed in real implementation)
INSERT INTO users (id, username, email)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin', 'admin@example.com'),
  ('00000000-0000-0000-0000-000000000002', 'staff', 'staff@example.com')
ON CONFLICT (username) DO NOTHING;

-- Insert user roles
INSERT INTO user_roles (user_id, role)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'user')
ON CONFLICT (user_id) DO NOTHING;

-- Pre-populate permissions
-- Insert admin permissions (all permissions set to true)
INSERT INTO user_permissions (user_id, permission, value)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'viewCustomerDatabase', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'editCustomerDatabase', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'downloadReports', TRUE), 
  ('00000000-0000-0000-0000-000000000001', 'manageUsers', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'generateSlips', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'viewLogs', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'viewBoxWeights', TRUE), 
  ('00000000-0000-0000-0000-000000000001', 'editBoxWeights', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'editCompletedBoxWeights', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'cancelSlips', TRUE), 
  ('00000000-0000-0000-0000-000000000001', 'printSlips', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'reprintSlips', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'deleteCustomers', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'viewReports', TRUE), 
  ('00000000-0000-0000-0000-000000000001', 'viewCouriers', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'editCouriers', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'viewSenders', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'editSenders', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'useExpressMode', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'manageExpressMode', TRUE)
ON CONFLICT (user_id, permission) DO NOTHING;

-- Insert staff permissions (limited set to true, others false)
INSERT INTO user_permissions (user_id, permission, value)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'viewCustomerDatabase', TRUE),
  ('00000000-0000-0000-0000-000000000002', 'editCustomerDatabase', TRUE),
  ('00000000-0000-0000-0000-000000000002', 'downloadReports', FALSE), 
  ('00000000-0000-0000-0000-000000000002', 'manageUsers', FALSE),
  ('00000000-0000-0000-0000-000000000002', 'generateSlips', TRUE),
  ('00000000-0000-0000-0000-000000000002', 'viewLogs', FALSE),
  ('00000000-0000-0000-0000-000000000002', 'viewBoxWeights', TRUE), 
  ('00000000-0000-0000-0000-000000000002', 'editBoxWeights', TRUE),
  ('00000000-0000-0000-0000-000000000002', 'editCompletedBoxWeights', FALSE),
  ('00000000-0000-0000-0000-000000000002', 'cancelSlips', FALSE), 
  ('00000000-0000-0000-0000-000000000002', 'printSlips', TRUE),
  ('00000000-0000-0000-0000-000000000002', 'reprintSlips', TRUE),
  ('00000000-0000-0000-0000-000000000002', 'deleteCustomers', FALSE),
  ('00000000-0000-0000-0000-000000000002', 'viewReports', FALSE), 
  ('00000000-0000-0000-0000-000000000002', 'viewCouriers', TRUE),
  ('00000000-0000-0000-0000-000000000002', 'editCouriers', FALSE),
  ('00000000-0000-0000-0000-000000000002', 'viewSenders', TRUE),
  ('00000000-0000-0000-0000-000000000002', 'editSenders', FALSE),
  ('00000000-0000-0000-0000-000000000002', 'useExpressMode', FALSE),
  ('00000000-0000-0000-0000-000000000002', 'manageExpressMode', FALSE)
ON CONFLICT (user_id, permission) DO NOTHING;

-- Add missing columns to transactions and members
ALTER TABLE transactions ADD COLUMN month INTEGER;
ALTER TABLE transactions ADD COLUMN year INTEGER;
ALTER TABLE members ADD COLUMN payment_start_date TEXT;
ALTER TABLE transactions ADD COLUMN member_id INTEGER REFERENCES members(id);

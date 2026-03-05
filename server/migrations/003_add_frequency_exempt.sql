-- Migration: Add frequency_exempt column to members table
ALTER TABLE members ADD COLUMN frequency_exempt INTEGER DEFAULT 0;

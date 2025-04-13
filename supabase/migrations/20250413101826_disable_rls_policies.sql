-- Migration: disable_rls_policies
-- Description: Disables all row level security policies and RLS itself on tables
-- Created at: 2025-04-13

-- Drop all existing policies
-- Source table policies
DROP POLICY IF EXISTS "Users can view their own sources" ON source;
DROP POLICY IF EXISTS "Users can insert their own sources" ON source;
DROP POLICY IF EXISTS "Users can update their own sources" ON source;
DROP POLICY IF EXISTS "Users can delete their own sources" ON source;
DROP POLICY IF EXISTS "Anon users cannot select sources" ON source;
DROP POLICY IF EXISTS "Anon users cannot insert sources" ON source;

-- Generations table policies
DROP POLICY IF EXISTS "Users can view their own generations" ON generations;
DROP POLICY IF EXISTS "Users can insert their own generations" ON generations;
DROP POLICY IF EXISTS "Users can update their own generations" ON generations;
DROP POLICY IF EXISTS "Users can delete their own generations" ON generations;
DROP POLICY IF EXISTS "Anon users cannot select generations" ON generations;
DROP POLICY IF EXISTS "Anon users cannot insert generations" ON generations;

-- Flashcards table policies
DROP POLICY IF EXISTS "Users can view their own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can insert their own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can update their own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can delete their own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Anon users cannot select flashcards" ON flashcards;
DROP POLICY IF EXISTS "Anon users cannot insert flashcards" ON flashcards;

-- Generation errors log table policies
DROP POLICY IF EXISTS "Users can view their own generation errors" ON generation_errors_log;
DROP POLICY IF EXISTS "Users can insert their own generation errors" ON generation_errors_log;
DROP POLICY IF EXISTS "Anon users cannot select generation errors" ON generation_errors_log;
DROP POLICY IF EXISTS "Anon users cannot insert generation errors" ON generation_errors_log;

-- Disable row level security on all tables
ALTER TABLE source DISABLE ROW LEVEL SECURITY;
ALTER TABLE generations DISABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards DISABLE ROW LEVEL SECURITY;
ALTER TABLE generation_errors_log DISABLE ROW LEVEL SECURITY; 
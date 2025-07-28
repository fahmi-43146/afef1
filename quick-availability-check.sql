-- QUICK AVAILABILITY SLOTS CHECK
-- Run this to see what's blocking availability slot creation

-- Check policies on availability_slots
SELECT 'CURRENT POLICIES:' as info;
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'availability_slots';

-- Check RLS status
SELECT 'RLS ENABLED:' as info;
SELECT rowsecurity FROM pg_tables 
WHERE tablename = 'availability_slots' AND schemaname = 'public';

-- Check if any slots exist
SELECT 'EXISTING SLOTS:' as info;
SELECT COUNT(*) as count FROM public.availability_slots; 
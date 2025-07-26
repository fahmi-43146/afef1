-- Chapters Course Database Setup
-- Run this in your Supabase SQL Editor

-- =============================================================================
-- 1. CREATE TABLES (if they don't exist)
-- =============================================================================

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'professor', 'admin')),
    avatar_url TEXT,
    student_id TEXT,
    department TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chapters table
CREATE TABLE IF NOT EXISTS public.chapters (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    duration INTEGER,
    order_index INTEGER NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
    release_date TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Availability slots table
CREATE TABLE IF NOT EXISTS public.availability_slots (
    id BIGSERIAL PRIMARY KEY,
    professor_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT,
    slot_type TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location TEXT,
    virtual_link TEXT,
    max_bookings INTEGER DEFAULT 1,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id BIGSERIAL PRIMARY KEY,
    availability_slot_id BIGINT REFERENCES public.availability_slots(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    booking_reason TEXT,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES auth.users(id),
    is_pinned BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    event_date DATE,
    event_time TIME,
    location TEXT,
    importance_level TEXT DEFAULT 'normal' CHECK (importance_level IN ('low', 'normal', 'high', 'urgent')),
    announcement_type TEXT DEFAULT 'announcement' CHECK (announcement_type IN ('announcement', 'event', 'deadline', 'update'))
);

-- Messages/Conversations table (for future messaging system)
CREATE TABLE IF NOT EXISTS public.conversations (
    id BIGSERIAL PRIMARY KEY,
    student_id UUID REFERENCES auth.users(id),
    professor_id UUID REFERENCES auth.users(id),
    subject TEXT NOT NULL,
    category TEXT CHECK (category IN ('office_hours', 'technical_help', 'course_question', 'appointment', 'general')),
    priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
    status TEXT CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')) DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual messages table (for future messaging system)
CREATE TABLE IF NOT EXISTS public.messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'image', 'file', 'system')) DEFAULT 'text',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 3. DROP EXISTING POLICIES (if any)
-- =============================================================================

DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Anyone can view published chapters" ON public.chapters;
DROP POLICY IF EXISTS "Admins can manage chapters" ON public.chapters;

DROP POLICY IF EXISTS "Anyone can view active availability slots" ON public.availability_slots;
DROP POLICY IF EXISTS "Professors can manage their availability slots" ON public.availability_slots;

DROP POLICY IF EXISTS "Students can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Students can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Professors can view bookings for their slots" ON public.bookings;

DROP POLICY IF EXISTS "Anyone can view published announcements" ON public.announcements;
DROP POLICY IF EXISTS "Authors can manage their announcements" ON public.announcements;

DROP POLICY IF EXISTS "Students can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Students can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Professors can view all conversations" ON public.conversations;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;

-- =============================================================================
-- 4. CREATE RLS POLICIES
-- =============================================================================

-- PROFILES POLICIES
CREATE POLICY "Users can create their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- CHAPTERS POLICIES
CREATE POLICY "Anyone can view published chapters"
ON public.chapters FOR SELECT
USING (status = 'published');

CREATE POLICY "Admins can manage chapters"
ON public.chapters FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- AVAILABILITY SLOTS POLICIES
CREATE POLICY "Anyone can view active availability slots"
ON public.availability_slots FOR SELECT
USING (is_active = true);

CREATE POLICY "Professors can manage their availability slots"
ON public.availability_slots FOR ALL
USING (
    professor_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('professor', 'admin')
    )
)
WITH CHECK (
    professor_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('professor', 'admin')
    )
);

-- BOOKINGS POLICIES
CREATE POLICY "Students can view their own bookings"
ON public.bookings FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Students can create bookings"
ON public.bookings FOR INSERT
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own bookings"
ON public.bookings FOR UPDATE
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Professors can view bookings for their slots"
ON public.bookings FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.availability_slots
        WHERE id = availability_slot_id AND professor_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ANNOUNCEMENTS POLICIES
CREATE POLICY "Anyone can view published announcements"
ON public.announcements FOR SELECT
USING (is_published = true);

CREATE POLICY "Authors can manage their announcements"
ON public.announcements FOR ALL
USING (
    author_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    author_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- CONVERSATIONS POLICIES (for future messaging)
CREATE POLICY "Students can view their conversations"
ON public.conversations FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Students can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Professors can view all conversations"
ON public.conversations FOR SELECT
USING (
    professor_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('professor', 'admin')
    )
);

CREATE POLICY "Professors can update conversations"
ON public.conversations FOR UPDATE
USING (
    professor_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('professor', 'admin')
    )
);

-- MESSAGES POLICIES (for future messaging)
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.conversations
        WHERE id = conversation_id 
        AND (student_id = auth.uid() OR professor_id = auth.uid())
    )
);

CREATE POLICY "Users can create messages in their conversations"
ON public.messages FOR INSERT
WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.conversations
        WHERE id = conversation_id 
        AND (student_id = auth.uid() OR professor_id = auth.uid())
    )
);

-- =============================================================================
-- 5. CREATE FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_chapters_updated_at ON public.chapters;
CREATE TRIGGER update_chapters_updated_at
    BEFORE UPDATE ON public.chapters
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON public.announcements;
CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON public.announcements
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        CASE 
            WHEN NEW.email = 'anatounsi43146@gmail.com' THEN 'admin'
            ELSE 'student'
        END
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- Chapters indexes
CREATE INDEX IF NOT EXISTS chapters_status_idx ON public.chapters(status);
CREATE INDEX IF NOT EXISTS chapters_order_idx ON public.chapters(order_index);
CREATE INDEX IF NOT EXISTS chapters_release_date_idx ON public.chapters(release_date);

-- Availability slots indexes
CREATE INDEX IF NOT EXISTS availability_slots_professor_id_idx ON public.availability_slots(professor_id);
CREATE INDEX IF NOT EXISTS availability_slots_start_time_idx ON public.availability_slots(start_time);
CREATE INDEX IF NOT EXISTS availability_slots_is_active_idx ON public.availability_slots(is_active);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS bookings_student_id_idx ON public.bookings(student_id);
CREATE INDEX IF NOT EXISTS bookings_availability_slot_id_idx ON public.bookings(availability_slot_id);

-- Announcements indexes
CREATE INDEX IF NOT EXISTS announcements_author_id_idx ON public.announcements(author_id);
CREATE INDEX IF NOT EXISTS announcements_is_published_idx ON public.announcements(is_published);
CREATE INDEX IF NOT EXISTS announcements_created_at_idx ON public.announcements(created_at);

-- Messages indexes
CREATE INDEX IF NOT EXISTS conversations_student_id_idx ON public.conversations(student_id);
CREATE INDEX IF NOT EXISTS conversations_professor_id_idx ON public.conversations(professor_id);
CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);

-- =============================================================================
-- SETUP COMPLETE!
-- =============================================================================

-- Verify setup
SELECT 'Database setup completed successfully!' as status;
SELECT 'Tables created:' as info, count(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN (
    'profiles', 'chapters', 'availability_slots', 'bookings', 
    'announcements', 'conversations', 'messages'
); 
-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrganizerProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EventImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reservation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ticket" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TicketTransfer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

-- 1. USER TABLE POLICIES
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON "User" FOR SELECT USING (auth.uid()::text = id);
-- Admins/Super Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON "User" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- 2. EVENT TABLE POLICIES
-- Anyone can view published and approved events
CREATE POLICY "Anyone can view active events" ON "Event" FOR SELECT USING (status = 'PUBLISHED' AND "approvedByAdmin" = true);
-- Organizers can view their own events (even drafts)
CREATE POLICY "Organizers can view own events" ON "Event" FOR SELECT USING (auth.uid()::text = "organizerId");

-- 3. TICKET TABLE POLICIES
-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON "Ticket" FOR SELECT USING (auth.uid()::text = "userId");
-- Organizers can view tickets for their events
CREATE POLICY "Organizers can view event tickets" ON "Ticket" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "Event" WHERE id = "eventId" AND "organizerId" = auth.uid()::text)
);

-- 4. MESSAGE TABLE POLICIES
-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages" ON "Message" FOR SELECT USING (
  auth.uid()::text = "senderId" OR auth.uid()::text = "receiverId"
);

-- 5. AUDIT LOG POLICIES (Strict)
-- Only Admins and Super Admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON "AuditLog" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- 1. Ensure bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;


-- 2. Public View Policy (Everyone)
CREATE POLICY "Public View"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'events');

-- 3. Upload Policy (Organizers)
-- Allows organizers to upload if they are authenticated
CREATE POLICY "Organizers can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'events' AND 
  (auth.jwt() ->> 'role' = 'ORGANIZER')
);

-- 4. Update/Delete Policy (Owner or Admin)
-- Allows organizers to manage their own files, or Admins to manage everything
CREATE POLICY "Organizers or Admins can manage"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'events' AND (
    (auth.uid()::text = owner::text) OR -- The user who uploaded it
    (auth.jwt() ->> 'role' IN ('ADMIN', 'SUPER_ADMIN')) -- Admin override
  )
);
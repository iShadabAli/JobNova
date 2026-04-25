const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { authenticateUser } = require('../middleware/authMiddleware');

// Get all chat sessions for the logged-in user
router.get('/sessions', authenticateUser, async (req, res) => {
    try {
        const authUserId = req.user.id;
        
        // Find profile ID
        const { data: userProfile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('user_id', authUserId)
            .single();
            
        if (profileError || !userProfile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }
        
        const profileId = userProfile.id;
        
        // Fetch sessions where user is either employer or candidate
        const { data: sessions, error } = await supabaseAdmin
            .from('chat_sessions')
            .select(`
                id,
                job_id,
                employer_id,
                candidate_id,
                updated_at,
                jobs ( title ),
                employer:profiles!chat_sessions_employer_id_fkey ( full_name, company_name ),
                candidate:profiles!chat_sessions_candidate_id_fkey ( full_name )
            `)
            .or(`employer_id.eq.${profileId},candidate_id.eq.${profileId}`)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching chat sessions:', error);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        // Fetch unread messages assigned to this user
        const { data: unreadMessages, error: unreadError } = await supabaseAdmin
            .from('chat_messages')
            .select('session_id')
            .eq('is_read', false)
            .neq('sender_id', profileId);

        let unreadCounts = {};
        if (!unreadError && unreadMessages) {
            unreadMessages.forEach(msg => {
                unreadCounts[msg.session_id] = (unreadCounts[msg.session_id] || 0) + 1;
            });
        }

        const enrichedSessions = sessions.map(session => ({
            ...session,
            unreadCount: unreadCounts[session.id] || 0
        }));

        res.json(enrichedSessions);
    } catch (err) {
        console.error('Server error in /sessions:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get messages for a specific session
router.get('/:sessionId/messages', authenticateUser, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const authUserId = req.user.id;

        // Verify user profile ID
        const { data: userProfile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('user_id', authUserId)
            .single();
            
        if (profileError || !userProfile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }
        
        const profileId = userProfile.id;

        // Verify user is part of the session
        const { data: session, error: sessionError } = await supabaseAdmin
            .from('chat_sessions')
            .select('id')
            .eq('id', sessionId)
            .or(`employer_id.eq.${profileId},candidate_id.eq.${profileId}`)
            .single();

        if (sessionError || !session) {
            return res.status(403).json({ success: false, message: 'Session not found or access denied' });
        }

        // Fetch messages
        const { data: messages, error } = await supabaseAdmin
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching chat messages:', error);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json(messages);
    } catch (err) {
        console.error('Server error in /messages:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Start or get existing chat session
router.post('/start', authenticateUser, async (req, res) => {
    try {
        const { job_id, candidate_id } = req.body;
        const userId = req.user.id; // This is the auth.users id
        
        // 1. First get the employer's profile ID
        const { data: employerProfile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (profileError || !employerProfile) {
            return res.status(404).json({ success: false, message: 'Employer profile not found' });
        }
        
        const employer_id = employerProfile.id; // The profiles table UUID

        if (!candidate_id) {
            return res.status(400).json({ success: false, message: 'Candidate ID is required' });
        }

        // 2. Then get the candidate's profile ID
        const { data: candidateProfile, error: candidateProfileError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('user_id', candidate_id)
            .single();

        if (candidateProfileError || !candidateProfile) {
            return res.status(404).json({ success: false, message: 'Candidate profile not found' });
        }

        const candidate_profile_id = candidateProfile.id;

        // 3. Check if a session already exists
        let query = supabaseAdmin
            .from('chat_sessions')
            .select(`
                id,
                job_id,
                employer_id,
                candidate_id,
                updated_at,
                jobs ( title ),
                employer:profiles!chat_sessions_employer_id_fkey ( full_name, company_name ),
                candidate:profiles!chat_sessions_candidate_id_fkey ( full_name )
            `)
            .eq('employer_id', employer_id)
            .eq('candidate_id', candidate_profile_id);

        if (job_id) {
            query = query.eq('job_id', job_id);
        } else {
            query = query.is('job_id', null);
        }

        const { data: existingSession, error: checkError } = await query.maybeSingle();

        if (existingSession) {
            return res.json({ session: existingSession });
        }

        // 4. Create new session if none exists
        const { data: newSession, error: createError } = await supabaseAdmin
            .from('chat_sessions')
            .insert([{
                job_id: job_id || null,
                employer_id,
                candidate_id: candidate_profile_id
            }])
            .select(`
                id,
                job_id,
                employer_id,
                candidate_id,
                updated_at,
                jobs ( title ),
                employer:profiles!chat_sessions_employer_id_fkey ( full_name, company_name ),
                candidate:profiles!chat_sessions_candidate_id_fkey ( full_name )
            `)
            .single();

        if (createError) {
            console.error('Error creating chat session:', createError);
            return res.status(500).json({ success: false, message: 'Failed to create chat session' });
        }

        res.json({ session: newSession });
    } catch (err) {
        console.error('Server error in /start:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Send a message
router.post('/:sessionId/message', authenticateUser, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { content } = req.body;
        const authUserId = req.user.id;

        // Verify user profile ID
        const { data: userProfile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('user_id', authUserId)
            .single();
            
        if (profileError || !userProfile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }
        
        const senderProfileId = userProfile.id;

        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: 'Message content is required' });
        }

        // Verify user is part of the session
        const { data: session, error: sessionError } = await supabaseAdmin
            .from('chat_sessions')
            .select('id')
            .eq('id', sessionId)
            .or(`employer_id.eq.${senderProfileId},candidate_id.eq.${senderProfileId}`)
            .single();

        if (sessionError || !session) {
            return res.status(403).json({ success: false, message: 'Session not found or access denied' });
        }

        // Insert message
        const { data: message, error } = await supabaseAdmin
            .from('chat_messages')
            .insert([{
                session_id: sessionId,
                sender_id: senderProfileId,
                content: content.trim()
            }])
            .select()
            .single();

        if (error) {
            console.error('Error sending message:', error);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        // Update session's updated_at timestamp
        await supabaseAdmin
            .from('chat_sessions')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', sessionId);

        res.json({ message });
    } catch (err) {
        console.error('Server error in /message:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Mark messages as read
router.patch('/:sessionId/read', authenticateUser, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const authUserId = req.user.id;

        // Find profile ID
        const { data: userProfile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('user_id', authUserId)
            .single();
            
        if (profileError || !userProfile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }
        
        const profileId = userProfile.id;

        // Update all unread messages in the session that were NOT sent by the current user
        const { error } = await supabaseAdmin
            .from('chat_messages')
            .update({ is_read: true })
            .eq('session_id', sessionId)
            .neq('sender_id', profileId)
            .eq('is_read', false);

        if (error) {
            console.error('Error marking messages as read:', error);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Server error in /read:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;

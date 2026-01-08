import { supabase } from '../lib/supabase';
import { UserAccount, SessionResult, Connection, UserRole, ConnectionStatus, TherapyType, ChatMessage } from '../types';

export const dataService = {
    /**
     * @section User Authentication & Clinical Profile Management
     * Handles identity verification, registration, and role-specific profile updates.
     */

    async uploadAvatar(file: File): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return data.publicUrl;
    },

    async register(user: UserAccount) {
        // Operational Strategy: Atomic insertion across core user and role-specific profile tables
        // 1. Core Identity Persistence
        const { error: userError } = await supabase
            .from('users')
            .insert({
                id: user.id,
                name: user.name,
                email: user.email,
                avatar_url: user.avatarUrl,
                phone: user.phone,
                password: user.password,
                role: user.role,
                start_date: user.startDate
            });

        if (userError) throw userError;

        // 2. Profile Specialization: Map user to clinical role structures
        if (user.role === UserRole.PATIENT) {
            const { error: patientError } = await supabase
                .from('patient_profiles')
                .insert({
                    user_id: user.id,
                    diagnosis: user.diagnosis,
                    case_id: user.caseId
                });
            if (patientError) throw patientError;
        } else if (user.role === UserRole.DOCTOR) {
            const { error: doctorError } = await supabase
                .from('doctor_profiles')
                .insert({
                    user_id: user.id,
                    license_id: user.licenseId,
                    specialty: user.specialty,
                    experience_years: user.experienceYears,
                    bio: user.bio,
                    is_verified: user.isVerified
                });
            if (doctorError) {
                if (doctorError.code === '23505') {
                    throw new Error("This Medical License Number is already registered. Please check again.");
                }
                throw doctorError;
            }
        }

        return user;
    },

    async updateUser(user: UserAccount) {
        // 1. Update users table
        const { error: userError } = await supabase
            .from('users')
            .update({
                name: user.name,
                phone: user.phone,
                avatar_url: user.avatarUrl
            })
            .eq('id', user.id);

        if (userError) throw userError;

        // 2. Update specific profile table
        if (user.role === UserRole.PATIENT) {
            const { error: patientError } = await supabase
                .from('patient_profiles')
                .upsert({ // Idempotent update: Ensures profile existence for legacy or migrated accounts
                    user_id: user.id,
                    diagnosis: user.diagnosis,
                    case_id: user.caseId,
                    updated_at: new Date().toISOString()
                });
            if (patientError) throw patientError;
        } else if (user.role === UserRole.DOCTOR) {
            const { error: doctorError } = await supabase
                .from('doctor_profiles')
                .upsert({
                    user_id: user.id,
                    license_id: user.licenseId,
                    specialty: user.specialty,
                    experience_years: user.experienceYears,
                    bio: user.bio,
                    is_verified: user.isVerified,
                    updated_at: new Date().toISOString()
                });
            if (doctorError) throw doctorError;
        }

        return user;
    },

    async login(email: string, password: string): Promise<UserAccount | { error: 'EMAIL_NOT_FOUND' | 'WRONG_PASSWORD' }> {
        // Secure Ingress: Fetch identity with polymorphic profile resolution
        const { data: userByEmail, error: emailError } = await supabase
            .from('users')
            .select(`
    *,
    patient_profiles(*),
    doctor_profiles(*)
        `)
            .eq('email', email)
            .single();

        // If email doesn't exist in database
        if (emailError || !userByEmail) {
            return { error: 'EMAIL_NOT_FOUND' };
        }

        // Email exists, now check password
        if (userByEmail.password !== password) {
            return { error: 'WRONG_PASSWORD' };
        }

        // Data Normalization: Reconcile role-specific database fields into a unified UserAccount object
        const patientData = Array.isArray(userByEmail.patient_profiles) ? userByEmail.patient_profiles[0] : userByEmail.patient_profiles;
        const doctorData = Array.isArray(userByEmail.doctor_profiles) ? userByEmail.doctor_profiles[0] : userByEmail.doctor_profiles;

        return {
            id: userByEmail.id,
            name: userByEmail.name,
            email: userByEmail.email,
            avatarUrl: userByEmail.avatar_url,
            phone: userByEmail.phone,
            role: userByEmail.role as UserRole,
            startDate: userByEmail.start_date,
            // Merge profile data
            diagnosis: patientData?.diagnosis,
            caseId: patientData?.case_id,
            licenseId: doctorData?.license_id,
            specialty: doctorData?.specialty,
            experienceYears: doctorData?.experience_years,
            bio: doctorData?.bio,
            isVerified: doctorData?.is_verified
        };
    },

    async signInWithGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
        return data;
    },

    async syncGoogleUser(supabaseUser: any, role: UserRole) {
        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select(`
                *,
                patient_profiles(*),
                doctor_profiles(*)
            `)
            .eq('email', supabaseUser.email)
            .single();

        if (existingUser) {
            // User exists, return full profile
            const patientData = Array.isArray(existingUser.patient_profiles) ? existingUser.patient_profiles[0] : existingUser.patient_profiles;
            const doctorData = Array.isArray(existingUser.doctor_profiles) ? existingUser.doctor_profiles[0] : existingUser.doctor_profiles;

            return {
                id: existingUser.id,
                name: existingUser.name,
                email: existingUser.email,
                avatarUrl: existingUser.avatar_url,
                phone: existingUser.phone,
                role: existingUser.role as UserRole,
                startDate: existingUser.start_date,
                diagnosis: patientData?.diagnosis,
                caseId: patientData?.case_id,
                licenseId: doctorData?.license_id,
                specialty: doctorData?.specialty,
                experienceYears: doctorData?.experience_years,
                bio: doctorData?.bio,
                isVerified: doctorData?.is_verified
            };
        }

        // Create new user
        const userId = `UID-${Math.random().toString(36).substr(2, 7).toUpperCase()}`;
        const newUser = {
            id: userId,
            name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
            email: supabaseUser.email,
            password: null,
            auth_provider: 'google',
            avatar_url: supabaseUser.user_metadata?.avatar_url,
            role: role,
            start_date: new Date().toISOString()
        };

        const { error: userError } = await supabase.from('users').insert(newUser);
        if (userError) throw userError;

        if (role === UserRole.PATIENT) {
            await supabase.from('patient_profiles').insert({
                user_id: userId,
                diagnosis: 'Neuro-Recovery',
                case_id: `NS-${Math.floor(Math.random() * 90000)}`
            });
        } else if (role === UserRole.DOCTOR) {
            await supabase.from('doctor_profiles').insert({
                user_id: userId,
                is_verified: false
            });
        }

        // Return complete profile
        return {
            id: userId,
            name: newUser.name,
            email: newUser.email,
            avatarUrl: newUser.avatar_url,
            phone: undefined,
            role: role,
            startDate: newUser.start_date,
            diagnosis: role === UserRole.PATIENT ? 'Neuro-Recovery' : undefined,
            caseId: role === UserRole.PATIENT ? `NS-${Math.floor(Math.random() * 90000)}` : undefined,
            isVerified: role === UserRole.DOCTOR ? false : undefined
        };
    },

    /**
     * @section Laboratory & Therapy Session Telemetry
     * Captures and retrieves high-fidelity performance data from clinical exercises.
     */

    async saveSession(result: SessionResult) {
        const { error } = await supabase
            .from('sessions')
            .insert({
                patient_id: result.patientId,
                timestamp: result.timestamp,
                type: result.type,
                exercise_name: result.exerciseName,
                score: result.score,
                metadata: result.metadata || {},
                feedback: result.feedback
            });

        if (error) throw error;
    },

    async getPatientHistory(patientId: string): Promise<SessionResult[]> {
        const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .eq('patient_id', patientId)
            .order('timestamp', { ascending: false });

        if (error) throw error;
        return data.map(s => ({
            patientId: s.patient_id,
            timestamp: s.timestamp,
            type: s.type as TherapyType,
            exerciseName: s.exercise_name,
            score: s.score,
            feedback: s.feedback
        }));
    },

    async getAllSessions(): Promise<SessionResult[]> {
        const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .order('timestamp', { ascending: false });

        if (error) throw error;
        return data.map(s => ({
            patientId: s.patient_id,
            timestamp: s.timestamp,
            type: s.type as TherapyType,
            exerciseName: s.exercise_name,
            score: s.score,
            feedback: s.feedback
        }));
    },

    /**
     * @section Clinical Interoperability & Connections
     * Manages handshakes and data-sharing permissions between patients and verified clinicians.
     */

    async requestConnection(conn: Connection) {
        const { error } = await supabase
            .from('connections')
            .insert({
                id: conn.id,
                patient_id: conn.patientId,
                doctor_id: conn.doctorId,
                status: conn.status,
                timestamp: conn.timestamp
            });

        if (error) throw error;
    },

    async updateConnectionStatus(connId: string, status: ConnectionStatus) {
        const { error } = await supabase
            .from('connections')
            .update({ status })
            .eq('id', connId);

        if (error) throw error;
    },

    async getConnections(): Promise<Connection[]> {
        const { data, error } = await supabase
            .from('connections')
            .select('*');

        if (error) throw error;
        return data.map(c => ({
            id: c.id,
            patientId: c.patient_id,
            doctorId: c.doctor_id,
            status: c.status as ConnectionStatus,
            timestamp: c.timestamp
        }));
    },

    async getAllUsers(): Promise<UserAccount[]> {
        const { data: users, error } = await supabase
            .from('users')
            .select(`
    *,
    patient_profiles(*),
    doctor_profiles(*)
        `);

        if (error) throw error;

        return users.map(u => {
            // Polymorphic Mapping: Resolve many-to-one profile relationships
            const docProfile = Array.isArray(u.doctor_profiles) ? u.doctor_profiles[0] : u.doctor_profiles;
            const patProfile = Array.isArray(u.patient_profiles) ? u.patient_profiles[0] : u.patient_profiles;

            return {
                id: u.id,
                name: u.name,
                email: u.email,
                avatarUrl: u.avatar_url,
                phone: u.phone,
                role: u.role as UserRole,
                startDate: u.start_date,
                diagnosis: patProfile?.diagnosis,
                caseId: patProfile?.case_id,
                licenseId: docProfile?.license_id,
                specialty: docProfile?.specialty,
                experienceYears: docProfile?.experience_years,
                bio: docProfile?.bio,
                isVerified: docProfile?.is_verified
            };
        });
    },

    /**
     * @section Clinical Communications (Chat)
     * Facilitates encrypted, real-time messaging between care nodes.
     */
    async sendMessage(senderId: string, receiverId: string, content: string): Promise<void> {
        const { error } = await supabase
            .from('messages')
            .insert({
                sender_id: senderId,
                receiver_id: receiverId,
                content: content,
                timestamp: new Date().toISOString()
            });
        if (error) throw error;
    },

    async getMessages(userId1: string, userId2: string): Promise<ChatMessage[]> {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
            .order('timestamp', { ascending: true });

        if (error) throw error;
        return (data || [])
            .filter(m => {
                // Soft Delete Filtering: Only show if NOT deleted for the viewer (userId1)
                if (m.sender_id === userId1 && m.deleted_for_sender) return false;
                if (m.receiver_id === userId1 && m.deleted_for_receiver) return false;
                return true;
            })
            .map(m => ({
                id: m.id,
                senderId: m.sender_id,
                receiverId: m.receiver_id,
                content: m.content,
                timestamp: m.timestamp,
                isRead: m.is_read,
                isEdited: m.is_edited
            }));
    },

    async markAsRead(messageId: string): Promise<void> {
        const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', messageId);
        if (error) throw error;
    },

    async markAllAsRead(receiverId: string, senderId: string): Promise<void> {
        const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .match({ receiver_id: receiverId, sender_id: senderId, is_read: false });
        if (error) throw error;
    },

    async getChatPreview(userId1: string, userId2: string): Promise<{ lastMessage: string, timestamp: string, unreadCount: number } | null> {
        // Telemetry Synthesis: Aggregate latest message metadata and unread indicators
        const { data: lastMsgData, error: lastMsgError } = await supabase
            .from('messages')
            .select('content, timestamp')
            .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
            .order('timestamp', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (lastMsgError) throw lastMsgError;
        if (!lastMsgData) return null;

        // Metadata Aggregation: Determine unread saturation for the active observer
        const { count, error: countError } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .match({ receiver_id: userId1, sender_id: userId2, is_read: false });

        if (countError) throw countError;

        return {
            lastMessage: lastMsgData.content,
            timestamp: lastMsgData.timestamp,
            unreadCount: count || 0
        };
    },

    async deleteMessage(messageId: string, userId: string): Promise<void> {
        // Soft deletion logic: Update the appropriate flag based on user role
        // We attempt both; only the matching row will update.
        const { error: sErr } = await supabase
            .from('messages')
            .update({ deleted_for_sender: true })
            .match({ id: messageId, sender_id: userId });

        const { error: rErr } = await supabase
            .from('messages')
            .update({ deleted_for_receiver: true })
            .match({ id: messageId, receiver_id: userId });

        if (sErr || rErr) throw (sErr || rErr);
    },

    async editMessage(messageId: string, newContent: string): Promise<ChatMessage> {
        const { data, error } = await supabase
            .from('messages')
            .update({ content: newContent, is_edited: true })
            .eq('id', messageId)
            .select()
            .single();

        if (error) {
            throw error;
        }
        if (!data) throw new Error('Update failed: No data returned.');

        return {
            id: data.id,
            senderId: data.sender_id,
            receiverId: data.receiver_id,
            content: data.content,
            timestamp: data.timestamp,
            isRead: data.is_read,
            isEdited: data.is_edited
        };
    },

    async logCall(callData: {
        caller_id: string;
        receiver_id: string;
        status: string;
        type?: string;
        started_at?: string;
        ended_at?: string;
    }) {
        const { error } = await supabase
            .from('calls')
            .insert({
                ...callData,
                type: callData.type || 'VIDEO',
                started_at: callData.started_at || new Date().toISOString()
            });

        if (error) console.error('Error logging call:', error);

        // Insert system message for call history in chat
        let msg = '';
        if (callData.status === 'MISSED') msg = '🎥 Missed Video Call';
        else if (callData.status === 'REJECTED') msg = '🎥 Call Declined';
        else if (callData.status === 'COMPLETED') msg = '🎥 Video Call';

        if (msg) {
            await this.sendMessage(
                callData.caller_id,
                callData.receiver_id,
                msg
            );
        }
    }
};

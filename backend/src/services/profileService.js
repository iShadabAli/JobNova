const profileRepository = require('../repositories/profileRepository');
const resumeParserService = require('./resumeParserService');

const profileService = {
    getProfile: async (userId) => {
        let data = await profileRepository.findByUserId(userId);

        if (!data) {
            return {
                user_id: userId
            };
        }

        if (data.availability) {
            try {
                const parsed = JSON.parse(data.availability);
                data.availability_days = parsed.days;
                data.availability_hours = parsed.hours;
            } catch (e) {
                // If it's not valid JSON, leave as is
            }
        }

        return data;
    },

    updateProfile: async (userId, updates) => {
        // Prevent updating user_id or restricted fields
        delete updates.user_id;
        delete updates.created_at;

        if (updates.availability_days !== undefined || updates.availability_hours !== undefined) {
            updates.availability = JSON.stringify({
                days: updates.availability_days || '',
                hours: updates.availability_hours || ''
            });
            delete updates.availability_days;
            delete updates.availability_hours;
        }

        const existing = await profileRepository.findByUserId(userId);

        if (existing) {
            return await profileRepository.update(userId, updates);
        } else {
            const newProfile = await profileRepository.create(userId, updates);
            await profileRepository.markUserCompletedProfile(userId);
            return newProfile;
        }
    },

    uploadCV: async (userId, file) => {
        if (!file) throw new Error('No file provided');

        const fileExt = file.originalname.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload using Repository
        await profileRepository.uploadFileToStorage('resumes', filePath, file.buffer, file.mimetype);

        // Get Public URL
        const resumeUrl = profileRepository.getPublicUrl('resumes', filePath);

        // Perform Simulated AI Parsing
        const parsedData = await resumeParserService.parseResume(file.buffer);

        // Update Profiles Table
        await profileRepository.update(userId, { resume_url: resumeUrl });

        return { resumeUrl, parsedData };
    },

    uploadAvatar: async (userId, file) => {
        if (!file) throw new Error('No image provided');

        const fileExt = file.originalname.split('.').pop();
        const fileName = `${userId}-avatar-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Bucket for profile pictures (assuming we use 'avatars' bucket)
        // Note: ensure 'avatars' bucket is created in Supabase! If not, we might need a SQL script.
        // For MVP, we'll try to use a generic 'avatars' bucket or 'resumes' if that's all we have. 
        // Let's use 'avatars' and assume the user will create it if needed.
        await profileRepository.uploadFileToStorage('avatars', filePath, file.buffer, file.mimetype);

        const avatarUrl = profileRepository.getPublicUrl('avatars', filePath);

        // Update Profile
        await profileRepository.update(userId, { avatar_url: avatarUrl });

        return avatarUrl;
    },

    uploadVerificationDocument: async (userId, file) => {
        if (!file) throw new Error('No document provided');

        const fileExt = file.originalname.split('.').pop();
        const fileName = `${userId}-verification-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        await profileRepository.uploadFileToStorage('verifications', filePath, file.buffer, file.mimetype);

        const documentUrl = profileRepository.getPublicUrl('verifications', filePath);
        const status = 'pending';

        await profileRepository.update(userId, { 
            verification_document_url: documentUrl,
            verification_status: status
        });

        return { documentUrl, status };
    },

    getHiringHistory: async (employerId) => {
        const apps = await profileRepository.getHiringHistoryApps();

        const employerApps = apps.filter(app => app.jobs && app.jobs.employer_id === employerId);

        const enrichedApps = await Promise.all(employerApps.map(async (app) => {
            const profile = await profileRepository.getProfileNameRole(app.applicant_id);
            return {
                ...app,
                worker_name: profile?.full_name || 'Anonymous Worker'
            };
        }));

        return enrichedApps;
    },

    getPublicProfile: async (userId) => {
        return await profileRepository.getPublicProfile(userId);
    }
};

module.exports = profileService;

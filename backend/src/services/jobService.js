const jobRepository = require('../repositories/jobRepository');
const profileRepository = require('../repositories/profileRepository');
const { matchJobs } = require('../services/matchingService');
const notificationService = require('./notificationService');

const jobService = {
    createJob: async (jobData) => {
        return await jobRepository.createJob(jobData);
    },

    getJobs: async (type, searchWords = []) => {
        return await jobRepository.getJobs(type, searchWords);
    },

    deleteJob: async (jobId, employerId) => {
        const job = await jobRepository.getJobById(jobId);
        if (!job || job.employer_id !== employerId) {
            throw new Error('Unauthorized or Job not found');
        }
        return await jobRepository.deleteJob(jobId);
    },

    getMatchedJobs: async (userId, requestedType, searchWords = []) => {
        const profile = await profileRepository.findByUserId(userId);

        if (!profile) {
            throw new Error('Profile not found. Please complete your profile to get matches.');
        }

        const jobType = requestedType || (profile.role === 'Blue Collar' ? 'blue' : 'white');
        return await matchJobs(profile, jobType, searchWords);
    },

    getNearbyJobs: async (lat, lng, radiusKm = 10, searchWords = []) => {
        if (!lat || !lng) throw new Error('Latitude and longitude are required');
        return await jobRepository.getNearbyJobs(parseFloat(lat), parseFloat(lng), parseFloat(radiusKm), searchWords);
    },

    applyForJob: async (jobId, applicantId, resumeUrl, coverLetter) => {
        const existing = await jobRepository.findApplication(jobId, applicantId);
        if (existing) {
            throw new Error('You have already applied for this job');
        }

        const application = await jobRepository.createApplication({
            job_id: jobId,
            applicant_id: applicantId,
            resume_url: resumeUrl,
            cover_letter: coverLetter
        });

        // NOTIFY EMPLOYER: "A new worker applied to your job"
        const job = await jobRepository.getJobById(jobId);
        if (job) {
            const applicantProfile = await profileRepository.findByUserId(applicantId);
            const name = applicantProfile?.full_name || applicantProfile?.role || 'A worker';
            await notificationService.createNotification(
                job.employer_id,
                'NEW_APPLICANT',
                `${name} has applied for your job: ${job.title}`,
                application.id  // Store APPLICATION ID so employer can take action
            );
        }

        return application;
    },

    getMyJobs: async (employerId) => {
        return await jobRepository.getMyJobs(employerId);
    },

    getJobApplications: async (jobId, employerId) => {
        const job = await jobRepository.getJobById(jobId);
        if (!job || job.employer_id !== employerId) {
            throw new Error('Unauthorized or Job not found');
        }

        const apps = await jobRepository.getJobApplications(jobId);

        return await Promise.all(apps.map(async (app) => {
            const profile = await profileRepository.findByUserId(app.applicant_id);
            return {
                ...app,
                applicant_name: profile?.role ? `${profile.role} (User)` : 'Applicant',
                applicant_profile: profile
            };
        }));
    },

    updateApplicationStatus: async (applicationId, userId, status) => {
        const app = await jobRepository.getApplicationById(applicationId);
        if (!app) throw new Error('Application not found');

        const job = app.jobs;
        if (!job) throw new Error('Job not found');

        if (job.employer_id !== userId) {
            if (app.applicant_id === userId) {
                if (status !== 'In Progress' && status !== 'Rejected') {
                    throw new Error('Workers can only accept or reject offers');
                }
            } else {
                throw new Error('Unauthorized');
            }
        }

        const updatedApplication = await jobRepository.updateApplicationStatus(applicationId, status);

        // NOTIFICATIONS
        // 1. If employer updates status -> Notify Worker
        if (job.employer_id === userId) {
            let message = '';
            if (status === 'Offered') message = `You have received a job offer for: ${job.title}`;
            else if (status === 'Shortlisted') message = `You have been shortlisted for: ${job.title}`;
            else if (status === 'Rejected') message = `Your application was not selected for: ${job.title}`;
            else if (status === 'Completed') message = `The job "${job.title}" has been marked as Completed. Please leave a review!`;
            
            if (message) {
                await notificationService.createNotification(app.applicant_id, 'STATUS_UPDATE', message, job.id);
            }
        }
        
        // 2. If worker accepts/rejects offer -> Notify Employer
        if (app.applicant_id === userId) {
            let message = '';
            const workerProfile = await profileRepository.findByUserId(userId);
            const name = workerProfile?.fullName || workerProfile?.role || 'A worker';

            if (status === 'In Progress') message = `${name} has ACCEPTED your job offer for: ${job.title}`;
            else if (status === 'Rejected') message = `${name} has REJECTED your job offer for: ${job.title}`;

            if (message) {
                await notificationService.createNotification(job.employer_id, 'STATUS_UPDATE', message, job.id);
            }
        }

        return updatedApplication;
    },

    getWorkerApplications: async (userId) => {
        return await jobRepository.getWorkerApplications(userId);
    }
};

module.exports = jobService;

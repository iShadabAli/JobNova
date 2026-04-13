const jobService = require('../services/jobService');
const aiSearchMapper = require('../utils/aiSearchMapper');

exports.createJob = async (req, res) => {
    try {
        const {
            title, description, type, location,
            salary_range, hourly_rate, duration,
            skills, experience_level, availability,
            latitude, longitude
        } = req.body;

        const employer_id = req.user.id;

        const jobData = {
            employer_id, title, description, type, location,
            salary_range, hourly_rate, duration, skills,
            experience_level, availability,
            latitude, longitude
        };

        const job = await jobService.createJob(jobData);
        res.status(201).json({ message: 'Job posted successfully', job });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getJobs = async (req, res) => {
    try {
        const { type, search } = req.query; // 'white' or 'blue', plus optional natural language search string
        
        let searchWords = [];
        if (search && search.trim().length > 0) {
            // 🧠 Magic happens here: Convert natural slang/Urdu into professional English titles
            searchWords = await aiSearchMapper.getSemanticJobTitles(search);
        }

        const data = await jobService.getJobs(type, searchWords);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const employer_id = req.user.id;

        await jobService.deleteJob(id, employer_id);
        res.status(200).json({ message: 'Job deleted successfully' });
    } catch (error) {
        if (error.message.includes('Unauthorized') || error.message.includes('not found')) {
            return res.status(403).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.getMatchedJobs = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, search } = req.query;
        let searchWords = [];
        if (search && search.trim() !== '') {
            console.log(`[AI Search] Intercepted MatchedJobs search query: "${search}"`);
            searchWords = await aiSearchMapper.getSemanticJobTitles(search);
        }
        const matches = await jobService.getMatchedJobs(userId, type, searchWords);
        res.status(200).json(matches);
    } catch (error) {
        if (error.message.includes('Profile not found')) {
            return res.status(404).json({ message: error.message });
        }
        console.error('Matching Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getNearbyJobs = async (req, res) => {
    try {
        const { lat, lng, radius = 10, search } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        let searchWords = [];
        console.log(`[Nearby Jobs] Received search query: "${search}"`);
        if (search && search.trim() !== '') {
            searchWords = await aiSearchMapper.getSemanticJobTitles(search);
            console.log(`[Nearby Jobs] Search words mapped: ${JSON.stringify(searchWords)}`);
        }

        const nearbyJobs = await jobService.getNearbyJobs(lat, lng, radius, searchWords);
        console.log(`[Nearby Jobs] Returning ${nearbyJobs.length} jobs`);
        res.status(200).json(nearbyJobs);
    } catch (error) {
        console.error('Nearby Jobs Error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.applyForJob = async (req, res) => {
    try {
        const { id } = req.params; // job_id
        const applicant_id = req.user.id;
        const { resume_url, cover_letter } = req.body;

        const application = await jobService.applyForJob(id, applicant_id, resume_url, cover_letter);
        res.status(201).json({ message: 'Application submitted successfully', application });
    } catch (error) {
        if (error.message === 'You have already applied for this job') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.getMyJobs = async (req, res) => {
    try {
        const employer_id = req.user.id;
        const data = await jobService.getMyJobs(employer_id);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getJobApplications = async (req, res) => {
    try {
        const { id } = req.params; // job_id
        const employer_id = req.user.id;

        const enrichedApps = await jobService.getJobApplications(id, employer_id);
        res.status(200).json(enrichedApps);
    } catch (error) {
        if (error.message.includes('Unauthorized')) {
            return res.status(403).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params; // application_id
        const { status } = req.body;
        const userId = req.user.id;

        const application = await jobService.updateApplicationStatus(id, userId, status);
        res.status(200).json({ message: 'Status updated', application });
    } catch (error) {
        if (error.message.includes('Unauthorized') || error.message.includes('Only employers')) {
            return res.status(403).json({ error: error.message });
        }
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.getWorkerApplications = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await jobService.getWorkerApplications(userId);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

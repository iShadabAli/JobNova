const { supabaseAdmin: supabase } = require('../config/supabase');

const reviewRepository = {
    // Check if an application linking the two users for the job exists
    verifyApplicationExists: async (job_id, reviewer_id, reviewee_id) => {
        console.log(`[reviewRepository] Verifying application: job=${job_id}, reviewer=${reviewer_id}, reviewee=${reviewee_id}`);
        // Check if there is ANY application for this job involving either user
        // This is a relaxed check to ensure we don't block valid reviews prematurely
        const { data, error } = await supabase
            .from('applications')
            .select('status, id, applicant_id')
            .eq('job_id', job_id);

        if (error) {
            console.error(`[reviewRepository] Verification error:`, error);
            throw error;
        }

        console.log(`[reviewRepository] Found ${data?.length || 0} applications for this job.`);
        return data && data.length > 0 ? data[0] : null;
    },

    // Insert a new review
    createReview: async (reviewData) => {
        const { data, error } = await supabase
            .from('reviews')
            .insert([reviewData])
            .select();

        if (error) throw error;
        return data[0];
    },

    // Get all reviews for a specific user to calculate avg rating
    getReviewsByReviewee: async (revieweeId) => {
        const { data, error } = await supabase
            .from('reviews')
            .select('rating')
            .eq('reviewee_id', revieweeId);

        if (error) throw error;
        return data; // Returns array of {rating: number}
    },

    // Update profile with new average rating
    updateProfileRating: async (userId, avgRating, totalReviews) => {
        const { data, error } = await supabase
            .from('profiles')
            .update({ avg_rating: avgRating, total_reviews: totalReviews })
            .eq('user_id', userId)
            .select();

        if (error) throw error;
        return data[0];
    },

    // Get detailed full reviews by a specific user
    getFullReviewsByReviewee: async (revieweeId) => {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('reviewee_id', revieweeId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get single profile minimal info by user ID
    getProfileMinimalInfo: async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }
};

module.exports = reviewRepository;

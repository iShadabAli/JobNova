const reviewRepository = require('../repositories/reviewRepository');

const reviewService = {
    createReview: async (jobId, reviewerId, revieweeId, rating, comment) => {
        // Validation: Verify application link exists. 
        // We aren't strictly enforcing 'Completed' status validation here on the backend yet since frontend filters it,
        // but checking the linkage ensures a valid job relationship.
        const app = await reviewRepository.verifyApplicationExists(jobId, reviewerId, revieweeId);

        // Insert Review
        try {
            await reviewRepository.createReview({
                job_id: jobId,
                reviewer_id: reviewerId,
                reviewee_id: revieweeId,
                rating,
                comment
            });
        } catch (error) {
            if (error.code === '23505') { // Unique violation based on supabase error codes
                throw new Error('You have already reviewed this user for this job.');
            }
            throw error;
        }

        // Recalculate Average Rating for Reviewee
        const reviews = await reviewRepository.getReviewsByReviewee(revieweeId);
        const totalReviews = reviews.length;
        const sumRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = totalReviews > 0 ? (sumRatings / totalReviews).toFixed(2) : 0;

        // Update Profile
        await reviewRepository.updateProfileRating(revieweeId, avgRating, totalReviews);

        return avgRating;
    },

    getMyRatings: async (userId) => {
        return await reviewRepository.getFullReviewsByReviewee(userId);
    },

    getUserReviews: async (userId) => {
        const reviews = await reviewRepository.getFullReviewsByReviewee(userId);

        // Enhance with reviewer names
        const enrichedReviews = await Promise.all(reviews.map(async (review) => {
            const profile = await reviewRepository.getProfileMinimalInfo(review.reviewer_id);
            return {
                ...review,
                reviewer_name: profile?.role ? `${profile.role} User` : 'Anonymous'
            };
        }));

        return enrichedReviews;
    }
};

module.exports = reviewService;

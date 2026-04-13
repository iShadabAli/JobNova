const reviewService = require('../services/reviewService');

// Submit a Review
exports.createReview = async (req, res) => {
    try {
        console.log(`[createReview] Request body:`, req.body);
        const { job_id, reviewee_id, rating, comment } = req.body;
        const reviewer_id = req.user.id; // From middleware

        console.log(`[createReview] Submitting review: job=${job_id}, reviewer=${reviewer_id}, reviewee=${reviewee_id}, rating=${rating}`);
        const avgRating = await reviewService.createReview(job_id, reviewer_id, reviewee_id, rating, comment);

        res.status(201).json({ message: 'Review submitted successfully', avg_rating: avgRating });

    } catch (error) {
        if (error.message.includes('already reviewed')) {
            return res.status(400).json({ error: error.message });
        }
        console.error('Review submission error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get My Ratings (Reviews received by the logged-in worker)
exports.getMyRatings = async (req, res) => {
    try {
        const userId = req.user.id;
        const reviews = await reviewService.getMyRatings(userId);
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Reviews for a User
exports.getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;
        const enrichedReviews = await reviewService.getUserReviews(userId);
        res.status(200).json(enrichedReviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

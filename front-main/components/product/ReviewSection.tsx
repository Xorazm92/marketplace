
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './ReviewSection.module.scss';
import { 
  getProductReviews, 
  getProductRatingStats, 
  createReview, 
  markReviewHelpful,
  Review,
  CreateReviewData 
} from '../../endpoints/review';

interface ReviewSectionProps {
  productId: number;
}

interface RatingStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [newReview, setNewReview] = useState<CreateReviewData>({
    product_id: productId,
    rating: 5,
    title: '',
    comment: '',
    images: []
  });

  useEffect(() => {
    loadReviews();
    loadRatingStats();
  }, [productId, currentPage]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await getProductReviews(productId, currentPage);
      setReviews(response.reviews);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRatingStats = async () => {
    try {
      const stats = await getProductRatingStats(productId);
      setRatingStats(stats);
    } catch (error) {
      console.error('Error loading rating stats:', error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const review = await createReview(newReview);
      setReviews(prev => [review, ...prev]);
      setShowWriteReview(false);
      setNewReview({
        product_id: productId,
        rating: 5,
        title: '',
        comment: '',
        images: []
      });
      await loadRatingStats();
    } catch (error) {
      console.error('Error creating review:', error);
    }
  };

  const handleMarkHelpful = async (reviewId: number) => {
    try {
      await markReviewHelpful(reviewId);
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, helpful_count: review.helpful_count + 1 }
          : review
      ));
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`${styles.star} ${i <= rating ? styles.filled : styles.empty} ${interactive ? styles.interactive : ''}`}
          onClick={interactive ? () => setNewReview(prev => ({ ...prev, rating: i })) : undefined}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const renderRatingDistribution = () => {
    if (!ratingStats) return null;

    return (
      <div className={styles.ratingDistribution}>
        {[5, 4, 3, 2, 1].map(rating => (
          <div key={rating} className={styles.ratingBar}>
            <span className={styles.ratingLabel}>{rating} ⭐</span>
            <div className={styles.barContainer}>
              <div 
                className={styles.bar}
                style={{ 
                  width: `${ratingStats.totalReviews > 0 
                    ? (ratingStats.ratingDistribution[rating] || 0) / ratingStats.totalReviews * 100 
                    : 0}%` 
                }}
              />
            </div>
            <span className={styles.ratingCount}>
              {ratingStats.ratingDistribution[rating] || 0}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.reviewSection}>
      <div className={styles.reviewHeader}>
        <h2>Customer Reviews</h2>
        {ratingStats && (
          <div className={styles.overallRating}>
            <div className={styles.ratingScore}>
              <span className={styles.averageRating}>{ratingStats.averageRating.toFixed(1)}</span>
              <div className={styles.stars}>{renderStars(Math.round(ratingStats.averageRating))}</div>
              <span className={styles.totalReviews}>({ratingStats.totalReviews} reviews)</span>
            </div>
            {renderRatingDistribution()}
          </div>
        )}
      </div>

      <div className={styles.reviewActions}>
        <button 
          className={styles.writeReviewBtn}
          onClick={() => setShowWriteReview(true)}
        >
          Write a Review
        </button>
      </div>

      {showWriteReview && (
        <div className={styles.writeReviewForm}>
          <h3>Write Your Review</h3>
          <form onSubmit={handleSubmitReview}>
            <div className={styles.formGroup}>
              <label>Rating:</label>
              <div className={styles.ratingInput}>
                {renderStars(newReview.rating, true)}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Title (optional):</label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Review title"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Comment (optional):</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your experience with this product..."
                rows={4}
              />
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitBtn}>
                Submit Review
              </button>
              <button 
                type="button" 
                className={styles.cancelBtn}
                onClick={() => setShowWriteReview(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.reviewsList}>
        {loading ? (
          <div className={styles.loading}>Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className={styles.noReviews}>
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewerInfo}>
                  <img 
                    src={review.user.profile_img || '/img/default-avatar.png'} 
                    alt={review.user.first_name}
                    className={styles.avatar}
                  />
                  <div>
                    <h4>{review.user.first_name} {review.user.last_name}</h4>
                    <div className={styles.reviewMeta}>
                      <div className={styles.rating}>{renderStars(review.rating)}</div>
                      <span className={styles.date}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      {review.is_verified && (
                        <span className={styles.verified}>✓ Verified Purchase</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {review.title && (
                <h5 className={styles.reviewTitle}>{review.title}</h5>
              )}

              {review.comment && (
                <p className={styles.reviewComment}>{review.comment}</p>
              )}

              {review.images && review.images.length > 0 && (
                <div className={styles.reviewImages}>
                  {review.images.map((image, index) => (
                    <img key={index} src={image.url} alt={`Review ${index + 1}`} />
                  ))}
                </div>
              )}

              <div className={styles.reviewActions}>
                <button 
                  className={styles.helpfulBtn}
                  onClick={() => handleMarkHelpful(review.id)}
                >
                  👍 Helpful ({review.helpful_count})
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;

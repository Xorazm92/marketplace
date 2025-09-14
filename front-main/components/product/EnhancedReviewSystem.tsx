import React, { useState, useEffect } from 'react';
import {
  FiStar,
  FiThumbsUp,
  FiThumbsDown,
  FiFilter,
  FiSearch,
  FiCalendar,
  FiUser,
  FiMoreHorizontal,
  FiFlag,
  FiHeart,
  FiMessageCircle
} from 'react-icons/fi';
import {
  MdVerifiedUser,
  MdChildCare,
  MdSortByAlpha,
  MdFilterList
} from 'react-icons/md';
import { FaShieldAlt, FaCertificate } from 'react-icons/fa';
import styles from './EnhancedReviewSystem.module.scss';

interface Review {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  isVerifiedPurchase: boolean;
  isParent: boolean;
  rating: number;
  title: string;
  comment: string;
  date: string;
  helpfulCount: number;
  notHelpfulCount: number;
  images?: string[];
  parentAge?: string;
  childAge?: string;
  pros: string[];
  cons: string[];
  wouldRecommend: boolean;
  verified: boolean;
  response?: {
    sellerName: string;
    date: string;
    message: string;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  verifiedPurchases: number;
  parentReviews: number;
  recommendationRate: number;
}

interface EnhancedReviewSystemProps {
  productId: number;
  reviews: Review[];
  stats: ReviewStats;
  onWriteReview?: () => void;
  onHelpfulClick?: (reviewId: number, helpful: boolean) => void;
  onReportReview?: (reviewId: number) => void;
}

const EnhancedReviewSystem: React.FC<EnhancedReviewSystemProps> = ({
  productId,
  reviews,
  stats,
  onWriteReview,
  onHelpfulClick,
  onReportReview
}) => {
  const [filteredReviews, setFilteredReviews] = useState<Review[]>(reviews);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | 'verified' | 'parents' | '5star' | '4star' | '3star' | '2star' | '1star'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(5);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...reviews];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(review => 
        review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.userName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    switch (filterBy) {
      case 'verified':
        filtered = filtered.filter(review => review.isVerifiedPurchase);
        break;
      case 'parents':
        filtered = filtered.filter(review => review.isParent);
        break;
      case '5star':
        filtered = filtered.filter(review => review.rating === 5);
        break;
      case '4star':
        filtered = filtered.filter(review => review.rating === 4);
        break;
      case '3star':
        filtered = filtered.filter(review => review.rating === 3);
        break;
      case '2star':
        filtered = filtered.filter(review => review.rating === 2);
        break;
      case '1star':
        filtered = filtered.filter(review => review.rating === 1);
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'helpful':
        filtered.sort((a, b) => b.helpfulCount - a.helpfulCount);
        break;
    }

    setFilteredReviews(filtered);
    setCurrentPage(1);
  }, [reviews, sortBy, filterBy, searchQuery]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar 
        key={i} 
        className={i < rating ? styles.starFilled : styles.starEmpty}
      />
    ));
  };

  const getRatingBarWidth = (rating: number) => {
    const count = stats.ratingDistribution[rating] || 0;
    return stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
  };

  // Pagination
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

  return (
    <div className={styles.reviewSystem}>
      {/* Review Summary */}
      <div className={styles.reviewSummary}>
        <div className={styles.summaryLeft}>
          <div className={styles.overallRating}>
            <div className={styles.ratingNumber}>{stats.averageRating.toFixed(1)}</div>
            <div className={styles.ratingStars}>
              {getRatingStars(Math.round(stats.averageRating))}
            </div>
            <div className={styles.totalReviews}>
              {stats.totalReviews.toLocaleString()} ta sharh
            </div>
          </div>
        </div>
        
        <div className={styles.summaryRight}>
          <div className={styles.ratingBars}>
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className={styles.ratingBar}>
                <span className={styles.ratingLabel}>{rating}</span>
                <FiStar className={styles.starIcon} />
                <div className={styles.barContainer}>
                  <div 
                    className={styles.barFill}
                    style={{ width: `${getRatingBarWidth(rating)}%` }}
                  />
                </div>
                <span className={styles.ratingCount}>
                  {stats.ratingDistribution[rating] || 0}
                </span>
              </div>
            ))}
          </div>
          
          <div className={styles.reviewStats}>
            <div className={styles.statItem}>
              <MdVerifiedUser className={styles.statIcon} />
              <span>{Math.round((stats.verifiedPurchases / stats.totalReviews) * 100)}% tekshirilgan xarid</span>
            </div>
            <div className={styles.statItem}>
              <MdChildCare className={styles.statIcon} />
              <span>{Math.round((stats.parentReviews / stats.totalReviews) * 100)}% ota-onalar</span>
            </div>
            <div className={styles.statItem}>
              <FaShieldAlt className={styles.statIcon} />
              <span>{stats.recommendationRate}% tavsiya etadi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Actions */}
      <div className={styles.reviewActions}>
        <button className={styles.writeReviewBtn} onClick={onWriteReview}>
          <FiMessageCircle />
          <span>Sharh yozish</span>
        </button>
        
        <div className={styles.reviewControls}>
          {/* Search */}
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type=\"text\"
              placeholder=\"Sharhlarda qidirish...\"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          {/* Sort */}
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className={styles.sortSelect}
          >
            <option value=\"newest\">Eng yangi</option>
            <option value=\"oldest\">Eng eski</option>
            <option value=\"highest\">Yuqori reyting</option>
            <option value=\"lowest\">Past reyting</option>
            <option value=\"helpful\">Foydali</option>
          </select>
          
          {/* Filter */}
          <button 
            className={`${styles.filterBtn} ${showFilters ? styles.active : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className={styles.filterPanel}>
          <div className={styles.filterOptions}>
            <button 
              className={`${styles.filterOption} ${filterBy === 'all' ? styles.active : ''}`}
              onClick={() => setFilterBy('all')}
            >
              Barchasi ({reviews.length})
            </button>
            <button 
              className={`${styles.filterOption} ${filterBy === 'verified' ? styles.active : ''}`}
              onClick={() => setFilterBy('verified')}
            >
              Tekshirilgan ({reviews.filter(r => r.isVerifiedPurchase).length})
            </button>
            <button 
              className={`${styles.filterOption} ${filterBy === 'parents' ? styles.active : ''}`}
              onClick={() => setFilterBy('parents')}
            >
              Ota-onalar ({reviews.filter(r => r.isParent).length})
            </button>
            {[5, 4, 3, 2, 1].map(rating => (
              <button
                key={rating}
                className={`${styles.filterOption} ${filterBy === `${rating}star` ? styles.active : ''}`}
                onClick={() => setFilterBy(`${rating}star` as any)}
              >
                {rating} yulduz ({stats.ratingDistribution[rating] || 0})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className={styles.reviewsList}>
        {currentReviews.length === 0 ? (
          <div className={styles.noReviews}>
            <FiMessageCircle className={styles.noReviewsIcon} />
            <h3>Sharhlar topilmadi</h3>
            <p>Bu mahsulot uchun hali sharhlar yo'q yoki sizning qidiruv mezonlaringizga mos keluvchi sharh yo'q.</p>
          </div>
        ) : (
          currentReviews.map(review => (
            <div key={review.id} className={styles.reviewItem}>
              {/* Review Header */}
              <div className={styles.reviewHeader}>
                <div className={styles.userInfo}>
                  <img 
                    src={review.userAvatar || '/img/default-avatar.jpg'} 
                    alt={review.userName}
                    className={styles.userAvatar}
                  />
                  <div className={styles.userDetails}>
                    <div className={styles.userName}>
                      {review.userName}
                      {review.isVerifiedPurchase && (
                        <MdVerifiedUser className={styles.verifiedIcon} title=\"Tekshirilgan xarid\" />
                      )}
                      {review.isParent && (
                        <MdChildCare className={styles.parentIcon} title=\"Ota-ona\" />
                      )}
                    </div>
                    <div className={styles.reviewMeta}>
                      <span className={styles.reviewDate}>{formatDate(review.date)}</span>
                      {review.childAge && (
                        <span className={styles.childAge}>Bola yoshi: {review.childAge}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className={styles.reviewRating}>
                  {getRatingStars(review.rating)}
                </div>
              </div>
              
              {/* Review Content */}
              <div className={styles.reviewContent}>
                {review.title && (
                  <h4 className={styles.reviewTitle}>{review.title}</h4>
                )}
                
                <p className={styles.reviewComment}>{review.comment}</p>
                
                {/* Pros and Cons */}
                {(review.pros.length > 0 || review.cons.length > 0) && (
                  <div className={styles.prosAndCons}>
                    {review.pros.length > 0 && (
                      <div className={styles.pros}>
                        <h5>✓ Ijobiy tomonlari:</h5>
                        <ul>
                          {review.pros.map((pro, index) => (
                            <li key={index}>{pro}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {review.cons.length > 0 && (
                      <div className={styles.cons}>
                        <h5>✗ Salbiy tomonlari:</h5>
                        <ul>
                          {review.cons.map((con, index) => (
                            <li key={index}>{con}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className={styles.reviewImages}>
                    {review.images.map((image, index) => (
                      <img key={index} src={image} alt={`Review image ${index + 1}`} />
                    ))}
                  </div>
                )}
                
                {/* Recommendation */}
                {review.wouldRecommend && (
                  <div className={styles.recommendation}>
                    <FiHeart className={styles.recommendIcon} />
                    <span>Ushbu mahsulotni tavsiya etadi</span>
                  </div>
                )}
              </div>
              
              {/* Seller Response */}
              {review.response && (
                <div className={styles.sellerResponse}>
                  <div className={styles.responseHeader}>
                    <FaCertificate className={styles.sellerIcon} />
                    <strong>{review.response.sellerName}</strong>
                    <span className={styles.responseDate}>{formatDate(review.response.date)}</span>
                  </div>
                  <p className={styles.responseMessage}>{review.response.message}</p>
                </div>
              )}
              
              {/* Review Actions */}
              <div className={styles.reviewActions}>
                <div className={styles.helpfulButtons}>
                  <button 
                    className={styles.helpfulBtn}
                    onClick={() => onHelpfulClick?.(review.id, true)}
                  >
                    <FiThumbsUp />
                    <span>Foydali ({review.helpfulCount})</span>
                  </button>
                  
                  <button 
                    className={styles.helpfulBtn}
                    onClick={() => onHelpfulClick?.(review.id, false)}
                  >
                    <FiThumbsDown />
                    <span>Foydali emas ({review.notHelpfulCount})</span>
                  </button>
                </div>
                
                <button 
                  className={styles.reportBtn}
                  onClick={() => onReportReview?.(review.id)}
                >
                  <FiFlag />
                  <span>Shikoyat</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            className={styles.pageBtn}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Oldingi
          </button>
          
          <div className={styles.pageNumbers}>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <button
                  key={pageNumber}
                  className={`${styles.pageNumber} ${currentPage === pageNumber ? styles.active : ''}`}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>
          
          <button 
            className={styles.pageBtn}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Keyingi
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedReviewSystem;"
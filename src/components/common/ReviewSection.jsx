import React, { useState, useEffect } from "react";
import { FiStar, FiMessageSquare, FiSend } from "react-icons/fi";
import { submitReview, getTargetReviews } from "../../api/api-review";
import { useTheme } from "../../context/ThemeContext";
import {
  notifySuccess,
  notifyError,
} from "../../utils/services/toast/toast-service";

const ReviewSection = ({
  targetId,
  targetModel,
  currentUserId,
  targetOwnerId,
}) => {
  const { theme: t = {} } = useTheme();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await getTargetReviews(targetId);
        setReviews(res.data);
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      } finally {
        setLoading(false);
      }
    };
    if (targetId) fetchReviews();
  }, [targetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUserId) {
      notifyError("Please login to leave a review");
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitReview({
        targetId,
        targetModel,
        rating,
        comment,
      });
      setReviews([res.data, ...reviews]);
      setComment("");
      setRating(5);
      notifySuccess("Review submitted successfully!");
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return <div className="p-4 text-center opacity-50">Loading reviews...</div>;

  const isOwner =
    currentUserId && targetOwnerId && currentUserId === targetOwnerId;

  return (
    <div className="mt-10 space-y-8">
      {/* Average Score & Progress Bars */}
      <div className="bg-white dark:bg-gray-800/50 rounded-3xl p-8 border border-gray-100 dark:border-gray-700/50 shadow-sm">
        <div className="flex flex-col md:flex-row gap-10 items-center">
          {/* Average Score */}
          <div className="flex flex-col items-center text-center">
            <h4 className="text-5xl font-black mb-2" style={{ color: t.text }}>
              {reviews.length > 0
                ? (
                    reviews.reduce((acc, r) => acc + r.rating, 0) /
                    reviews.length
                  ).toFixed(1)
                : "0.0"}
            </h4>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => {
                const avg =
                  reviews.length > 0
                    ? reviews.reduce((acc, r) => acc + r.rating, 0) /
                      reviews.length
                    : 0;
                return (
                  <FiStar
                    key={s}
                    size={16}
                    className={
                      s <= Math.round(avg)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200 dark:text-gray-700"
                    }
                  />
                );
              })}
            </div>
            <p className="text-xs font-bold opacity-40 uppercase tracking-widest">
              {reviews.length} total reviews
            </p>
          </div>

          {/* Progress Bars */}
          <div className="flex-1 w-full space-y-2.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              const percentage =
                reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-4 group">
                  <div className="flex items-center gap-1.5 w-8">
                    <span className="text-xs font-black opacity-60 group-hover:opacity-100 transition-opacity">
                      {star}
                    </span>
                    <FiStar
                      size={10}
                      className="text-amber-400 fill-amber-400"
                    />
                  </div>
                  <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-900/50 rounded-full overflow-hidden border border-gray-50 dark:border-gray-800">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold opacity-30 w-8 text-right group-hover:opacity-60 transition-opacity">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Write a Review - Hidden for Owner */}
      {currentUserId && !isOwner && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800/50 rounded-3xl p-6 border border-gray-100 dark:border-gray-700/50 shadow-sm"
        >
          <p className="text-sm font-bold mb-4 opacity-70">
            Rate your experience
          </p>
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`transition-all duration-200 transform hover:scale-110 active:scale-95 ${
                  star <= (hoveredRating || rating) ? "scale-105" : ""
                }`}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <FiStar
                  size={32}
                  className={`${
                    star <= (hoveredRating || rating)
                      ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                      : "text-gray-200 dark:text-gray-700 hover:text-amber-200"
                  } transition-colors duration-200`}
                />
              </button>
            ))}
          </div>
          <div className="relative">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience (optional)..."
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[100px] resize-none"
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={submitting || !rating}
              className="absolute bottom-3 right-3 p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-600 disabled:opacity-50 disabled:translate-y-0 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiSend size={18} />
              )}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50/50 dark:bg-gray-900/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            <FiMessageSquare className="mx-auto mb-3 opacity-20" size={32} />
            <p className="text-sm font-medium opacity-50">
              No reviews yet. Be the first!
            </p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev._id}
              className="bg-white dark:bg-gray-800/30 rounded-3xl p-5 border border-gray-100 dark:border-gray-700/50"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      rev.reviewer?.profile?.avatar?.url ||
                      `https://ui-avatars.com/api/?name=${rev.reviewer?.username}&background=random`
                    }
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-800"
                  />
                  <div>
                    <h4 className="font-bold text-sm" style={{ color: t.text }}>
                      {rev.reviewer?.profile?.firstName
                        ? `${rev.reviewer.profile.firstName} ${rev.reviewer.profile.lastName}`
                        : rev.reviewer?.username}
                    </h4>
                    <span className="text-[10px] font-bold opacity-40 uppercase tracking-wider">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FiStar
                      key={s}
                      size={12}
                      className={
                        s <= rev.rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-200 dark:text-gray-700"
                      }
                    />
                  ))}
                </div>
              </div>
              <p
                className="text-sm leading-relaxed opacity-80"
                style={{ color: t.text }}
              >
                {rev.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;

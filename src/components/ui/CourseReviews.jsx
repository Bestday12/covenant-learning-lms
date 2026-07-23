// src/components/ui/CourseReviews.jsx
// Complete reviews system — star rating, submit form, display reviews
import { useState, useEffect } from "react";
import { Star, ThumbsUp, Edit2, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase.js";
import { useAuth } from "@/features/auth/AuthProvider.jsx";
import { useToast } from "@/components/ui/ToastProvider.jsx";

// ── Star Rating component ─────────────────────────────────────────────────────
export function StarRating({ value = 0, onChange, size = 24, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform ${!readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}
        >
          <Star
            size={size}
            className={`transition-colors ${
              star <= display
                ? "text-amber-400 fill-amber-400"
                : "text-slate-200 fill-slate-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Average stars display ─────────────────────────────────────────────────────
export function AverageStars({ average, count, size = 16 }) {
  if (!count) return null;
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`${
              star <= Math.round(average)
                ? "text-amber-400 fill-amber-400"
                : "text-slate-200 fill-slate-200"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-bold text-slate-700">{average.toFixed(1)}</span>
      <span className="text-sm text-slate-400">({count} review{count !== 1 ? "s" : ""})</span>
    </div>
  );
}

// ── Review form ───────────────────────────────────────────────────────────────
function ReviewForm({ courseId, existingReview, onSaved, onCancel }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [text, setText] = useState(existingReview?.review_text || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!rating) { showToast("Please select a star rating", "error"); return; }
    if (!user?.id) { showToast("Please log in to leave a review", "error"); return; }

    setSaving(true);
    try {
      if (existingReview) {
        const { error } = await supabase
          .from("course_reviews")
          .update({ rating, review_text: text.trim(), created_at: new Date().toISOString() })
          .eq("id", existingReview.id);
        if (error) throw error;
        showToast("Review updated!", "success");
      } else {
        const { error } = await supabase
          .from("course_reviews")
          .insert({ user_id: user.id, course_id: courseId, rating, review_text: text.trim() });
        if (error) throw error;
        showToast("Review submitted! Thank you 🙏", "success");
      }
      onSaved?.();
    } catch (err) {
      showToast(err.message || "Failed to save review", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
      <h3 className="font-serif text-lg font-bold text-brand-800 mb-4">
        {existingReview ? "Edit Your Review" : "Share Your Experience"}
      </h3>

      {/* Star selector */}
      <div className="mb-4">
        <p className="text-sm font-medium text-slate-600 mb-2">Your Rating</p>
        <StarRating value={rating} onChange={setRating} size={32} />
        {rating > 0 && (
          <p className="text-xs text-amber-600 mt-1 font-medium">
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
          </p>
        )}
      </div>

      {/* Review text */}
      <div className="mb-4">
        <p className="text-sm font-medium text-slate-600 mb-2">Your Review <span className="text-slate-400">(optional)</span></p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share how this course impacted your marriage..."
          rows={4}
          maxLength={500}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-50 resize-none"
        />
        <p className="text-xs text-slate-400 mt-1 text-right">{text.length}/500</p>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={saving || !rating}
          className="inline-flex items-center gap-2 rounded-full bg-[#3d0a6e] text-white px-6 py-2.5 text-sm font-bold hover:bg-[#5a1a9a] disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
          {saving ? "Saving..." : existingReview ? "Update Review" : "Submit Review"}
        </button>
        {onCancel && (
          <button onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-700">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

// ── Individual review card ────────────────────────────────────────────────────
function ReviewCard({ review, currentUserId, onEdit, onDelete }) {
  const isOwn = review.user_id === currentUserId;
  const date = new Date(review.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
  const name = review.profiles?.full_name || "Anonymous";
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3d0a6e] to-[#5a1a9a] flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">{initials}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{name}</p>
            <p className="text-xs text-slate-400">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating value={review.rating} size={14} readonly />
          {isOwn && (
            <div className="flex items-center gap-1 ml-2">
              <button onClick={() => onEdit?.(review)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <Edit2 size={12} />
              </button>
              <button onClick={() => onDelete?.(review)} className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
      {review.review_text && (
        <p className="text-sm text-slate-600 leading-relaxed">{review.review_text}</p>
      )}
    </div>
  );
}

// ── Main CourseReviews component ──────────────────────────────────────────────
export default function CourseReviews({ courseId, showForm = false }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [showFormState, setShowFormState] = useState(showForm);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("course_reviews")
        .select("*, profiles(full_name)")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (courseId) loadReviews(); }, [courseId]);

  const myReview = reviews.find((r) => r.user_id === user?.id);

  const average = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleDelete = async (review) => {
    if (!window.confirm("Delete your review?")) return;
    try {
      const { error } = await supabase.from("course_reviews").delete().eq("id", review.id);
      if (error) throw error;
      showToast("Review deleted", "success");
      loadReviews();
    } catch (err) {
      showToast("Failed to delete review", "error");
    }
  };

  const handleSaved = () => {
    setShowFormState(false);
    setEditingReview(null);
    loadReviews();
  };

  // Rating breakdown
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  if (loading) return (
    <div className="py-8 text-center">
      <Loader2 size={24} className="animate-spin text-slate-400 mx-auto" />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header + summary */}
      {reviews.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Average score */}
            <div className="text-center flex-shrink-0">
              <p className="text-6xl font-bold text-brand-800">{average.toFixed(1)}</p>
              <StarRating value={Math.round(average)} size={20} readonly />
              <p className="text-sm text-slate-500 mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
            </div>

            {/* Rating bars */}
            <div className="flex-1 space-y-2">
              {ratingCounts.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-500 w-4">{star}</span>
                  <Star size={12} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-400 h-2 rounded-full transition-all"
                      style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-4">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Write/edit review */}
      {user && showForm && !myReview && !showFormState && (
        <button
          onClick={() => setShowFormState(true)}
          className="w-full rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50 py-4 text-sm font-medium text-amber-700 hover:border-amber-300 transition-colors flex items-center justify-center gap-2"
        >
          <Star size={16} className="text-amber-400 fill-amber-400" />
          Write a Review
        </button>
      )}

      {(showFormState && !editingReview) && (
        <ReviewForm
          courseId={courseId}
          onSaved={handleSaved}
          onCancel={() => setShowFormState(false)}
        />
      )}

      {editingReview && (
        <ReviewForm
          courseId={courseId}
          existingReview={editingReview}
          onSaved={handleSaved}
          onCancel={() => setEditingReview(null)}
        />
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
          <Star size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No reviews yet</p>
          <p className="text-slate-400 text-sm mt-1">Be the first to share your experience</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Student Reviews <span className="text-slate-400 font-normal text-sm">({reviews.length})</span>
          </h3>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={user?.id}
              onEdit={setEditingReview}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

    </div>
  );
}

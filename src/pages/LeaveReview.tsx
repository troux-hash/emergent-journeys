import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Star, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const LeaveReview = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [operatorName, setOperatorName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!bookingId || !token) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.rpc("get_booking_for_review", {
        p_booking_id: bookingId,
        p_token: token,
      });
      if (!error && data && data.length > 0) {
        setValid(true);
        setOperatorName(data[0].operator_name);
        setAlreadyReviewed(data[0].already_reviewed);
      }
      setLoading(false);
    };
    load();
  }, [bookingId, token]);

  const handleSubmit = async () => {
    if (rating < 1) {
      toast.error("Please choose a star rating");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.rpc("submit_verified_review", {
      p_booking_id: bookingId,
      p_token: token,
      p_rating: rating,
      p_review_text: reviewText.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <p className="font-body text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl text-foreground mb-4">Link not valid</h1>
          <p className="font-body text-muted-foreground mb-8">
            This review link is invalid or has expired. If you'd still like to leave a review, reach out to us directly.
          </p>
          <Link to="/" className="font-label text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground px-6 py-3">
            Back to Fichua
          </Link>
        </div>
      </div>
    );
  }

  if (submitted || alreadyReviewed) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <CheckCircle className="w-10 h-10 text-gold mx-auto mb-4" strokeWidth={1.5} />
          <h1 className="font-display text-3xl text-foreground mb-4">Thank you!</h1>
          <p className="font-body text-muted-foreground mb-8">
            {submitted
              ? "Your review has been submitted and will appear once reviewed."
              : "You've already reviewed this stay."}
          </p>
          <Link to="/" className="font-label text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground px-6 py-3">
            Back to Fichua
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full">
        <p className="font-label text-xs tracking-[0.3em] uppercase text-gold mb-2 text-center">
          Verified Stay
        </p>
        <h1 className="font-display text-3xl text-foreground mb-2 text-center">
          How was {operatorName}?
        </h1>
        <p className="font-body text-sm text-muted-foreground mb-8 text-center">
          Your review will be tagged as a Verified Stay, since it's tied to your actual booking.
        </p>

        <div className="flex justify-center gap-1 mb-6">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
            >
              <Star
                size={32}
                className={(hoverRating || rating) >= n ? "text-gold fill-gold" : "text-muted-foreground"}
              />
            </button>
          ))}
        </div>

        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Tell other travelers about your stay (optional)"
          className="w-full bg-background border border-border px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors resize-none mb-4"
        />

        <button
          onClick={handleSubmit}
          disabled={submitting || rating < 1}
          className="w-full font-label text-sm tracking-[0.2em] uppercase bg-gold text-earth-dark py-4 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
};

export default LeaveReview;

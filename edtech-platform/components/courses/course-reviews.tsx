"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Star, StarHalf, MessageSquare, ThumbsUp } from "lucide-react";

interface Review {
  id: string;
  course_id: string;
  student_id: string;
  rating: number;
  comment: string;
  created_at: string;
  student: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  helpful_count: number;
}

interface CourseReviewsProps {
  courseId: string;
  isEnrolled?: boolean;
}

export function CourseReviews({
  courseId,
  isEnrolled = false,
}: CourseReviewsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState([0, 0, 0, 0, 0]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!courseId) return;

      try {
        setIsLoading(true);
        const supabase = createClient();

        // Fetch reviews for this course with student information
        const { data, error } = await supabase
          .from("reviews")
          .select(
            `
            *,
            student:profiles(id, full_name, avatar_url)
          `
          )
          .eq("course_id", courseId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Calculate stats
        if (data && data.length > 0) {
          const reviews = data as Review[];
          setReviews(reviews);
          setReviewsCount(reviews.length);

          // Calculate average rating
          const totalRating = reviews.reduce(
            (sum, review) => sum + review.rating,
            0
          );
          setAverageRating(
            parseFloat((totalRating / reviews.length).toFixed(1))
          );

          // Calculate rating distribution
          const distribution = [0, 0, 0, 0, 0];
          reviews.forEach((review) => {
            distribution[5 - Math.round(review.rating)]++;
          });
          setRatingDistribution(distribution);

          // Check if the current user has already submitted a review
          if (user) {
            const userReview = reviews.find(
              (review) => review.student_id === user.id
            );
            if (userReview) {
              setUserReview(userReview);
              setNewRating(userReview.rating);
              setNewComment(userReview.comment);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast({
          title: "Error",
          description: "Failed to load reviews. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [courseId, user]);

  const handleRatingChange = (rating: number) => {
    setNewRating(rating);
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to submit a review.",
        variant: "destructive",
      });
      return;
    }

    if (!isEnrolled) {
      toast({
        title: "Enrollment Required",
        description: "You need to enroll in this course to leave a review.",
        variant: "destructive",
      });
      return;
    }

    if (newComment.trim().length < 10) {
      toast({
        title: "Review too short",
        description:
          "Please provide a more detailed review (at least 10 characters).",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const supabase = createClient();

      // Determine if this is a new review or an update
      const isUpdate = userReview !== null;

      if (isUpdate) {
        // Update existing review
        const { error } = await supabase
          .from("reviews")
          .update({
            rating: newRating,
            comment: newComment,
          })
          .eq("id", userReview.id);

        if (error) throw error;

        // Update the review in the UI
        setReviews(
          reviews.map((review) =>
            review.id === userReview.id
              ? { ...review, rating: newRating, comment: newComment }
              : review
          )
        );

        setUserReview({
          ...userReview,
          rating: newRating,
          comment: newComment,
        });

        toast({
          title: "Review Updated",
          description: "Your review has been updated successfully.",
        });
      } else {
        // Create new review
        const { data, error } = await supabase
          .from("reviews")
          .insert({
            course_id: courseId,
            student_id: user.id,
            rating: newRating,
            comment: newComment,
            helpful_count: 0,
          })
          .select(
            `
            *,
            student:profiles(id, full_name, avatar_url)
          `
          )
          .single();

        if (error) throw error;

        // Add the new review to the UI
        setReviews([data as Review, ...reviews]);
        setUserReview(data as Review);
        setReviewsCount(reviewsCount + 1);

        // Recalculate average rating
        const totalRating =
          reviews.reduce((sum, review) => sum + review.rating, 0) + newRating;
        setAverageRating(
          parseFloat((totalRating / (reviews.length + 1)).toFixed(1))
        );

        toast({
          title: "Review Submitted",
          description: "Your review has been submitted successfully.",
        });
      }

      // Close the dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to mark reviews as helpful.",
        variant: "destructive",
      });
      return;
    }

    try {
      const supabase = createClient();

      // Check if the user has already marked this review as helpful
      const { data: existingVote } = await supabase
        .from("helpful_votes")
        .select()
        .eq("review_id", reviewId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingVote) {
        toast({
          title: "Already Voted",
          description: "You've already marked this review as helpful.",
        });
        return;
      }

      // Add a helpful vote
      await supabase.from("helpful_votes").insert({
        review_id: reviewId,
        user_id: user.id,
      });

      // Increment the helpful count
      await supabase.rpc("increment_helpful_count", {
        review_id: reviewId,
      });

      // Update the UI
      setReviews(
        reviews.map((review) =>
          review.id === reviewId
            ? { ...review, helpful_count: review.helpful_count + 1 }
            : review
        )
      );

      toast({
        title: "Marked as Helpful",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      console.error("Error marking review as helpful:", error);
      toast({
        title: "Error",
        description: "Failed to mark the review as helpful. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="bg-muted/50 rounded-lg p-4 text-center flex-shrink-0 w-full md:w-auto">
          <div className="text-4xl font-bold mb-1">{averageRating}</div>
          <div className="flex justify-center gap-1 my-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <div key={star}>
                {star <= Math.floor(averageRating) ? (
                  <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                ) : star - 0.5 <= averageRating ? (
                  <StarHalf className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                ) : (
                  <Star className="h-5 w-5 text-gray-300" />
                )}
              </div>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            {reviewsCount} {reviewsCount === 1 ? "review" : "reviews"}
          </div>
        </div>

        <div className="flex-1">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[5 - rating];
              const percentage =
                reviewsCount > 0 ? (count / reviewsCount) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-2">
                  <div className="text-sm w-2">{rating}</div>
                  <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs w-10 text-muted-foreground">
                    {percentage.toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!isEnrolled && !userReview}>
                {userReview ? "Edit Your Review" : "Write a Review"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {userReview ? "Edit Your Review" : "Write a Review"}
                </DialogTitle>
                <DialogDescription>
                  Share your experience with this course to help other students.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleRatingChange(rating)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            rating <= newRating
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Review
                  </label>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your experience with this course..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmitReview} disabled={isSubmitting}>
                  {isSubmitting
                    ? "Submitting..."
                    : userReview
                    ? "Update Review"
                    : "Submit Review"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!isEnrolled && !userReview && (
        <div className="bg-muted/30 p-4 rounded-lg text-center">
          <p className="text-muted-foreground mb-2">
            Want to share your experience? Enroll in this course to leave a
            review.
          </p>
          <Button onClick={() => router.push(`/courses/${courseId}`)}>
            View Course Details
          </Button>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="text-lg font-semibold">
          {reviewsCount > 0 ? "Student Reviews" : "No Reviews Yet"}
        </h3>

        {reviewsCount === 0 && (
          <div className="text-center py-10 border rounded-lg">
            <MessageSquare className="h-10 w-10 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium mb-1">No reviews yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to review this course!
            </p>
          </div>
        )}

        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex justify-between mb-3">
                <div className="flex items-center gap-2">
                  <UserAvatar
                    userId={review.student.id}
                    name={review.student.full_name}
                    avatarUrl={review.student.avatar_url}
                    size="sm"
                  />
                  <div>
                    <div className="font-medium">
                      {review.student.full_name}
                      {review.student_id === user?.id && (
                        <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded ml-2">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm mb-3">{review.comment}</p>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleMarkHelpful(review.id)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  disabled={review.student_id === user?.id}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>Helpful ({review.helpful_count})</span>
                </button>
                {review.student_id === user?.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDialogOpen(true)}
                    className="text-xs"
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

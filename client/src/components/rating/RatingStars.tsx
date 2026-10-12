import { useEffect, useState } from "react";
import {
  useCreateRatingMutation,
  useFindCurrentUserRatingQuery,
  useUpdateRatingMutation,
} from "../../redux/api/ratingAPI";
import { toast } from "sonner";
import { extractErrorMessage } from "../../utils/errorHandler";

const RatingStars = ({ doctorId }: { doctorId: string }) => {
  const totalStars = 5;
  const {
    isSuccess: isRatingSuccess,
    data: ratingData,
  } = useFindCurrentUserRatingQuery(doctorId);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [rateDoc] = useCreateRatingMutation();
  const [updateRating] = useUpdateRatingMutation();

  useEffect(() => {
    if (isRatingSuccess && ratingData) {
      setRating(ratingData.value);
    }
  }, [isRatingSuccess, ratingData]);

  const handleRating = async (rate: number) => {
    setRating(rate);
    try {
      if (ratingData?.id) {
        await updateRating({ id: ratingData.id, update: { value: rate } }).unwrap();
        toast.success("Rating updated.");
      } else {
        await rateDoc({ value: rate, doctorId }).unwrap();
        toast.success("Thanks for your rating.");
      }
    } catch (err) {
      toast.error(extractErrorMessage(err as any));
    }
  };

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rate doctor">
      {Array.from({ length: totalStars }, (_, index) => {
        const starValue = index + 1;
        const filled = starValue <= (hover || rating);
        return (
          <button
            type="button"
            key={index}
            role="radio"
            aria-checked={rating === starValue}
            aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
            className="text-2xl leading-none transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent/30 rounded"
            style={{ color: filled ? "#f59e0b" : "#e2e8f0" }}
            onClick={() => handleRating(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};

export default RatingStars;

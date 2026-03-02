import { useEffect, useState } from 'react';
import { useCreateRatingMutation, useFindCurrentUserRatingQuery, useUpdateRatingMutation } from '../../redux/api/ratingAPI';
import Error from '../utils/Error';

const RatingStars = ({doctorId}: {doctorId: string}) => {
  
  const totalStars = 5
  const {isError: isRatingError, isSuccess: isRatingSuccess, error: ratingError, data: ratingData, refetch} = useFindCurrentUserRatingQuery(doctorId)
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [rateDoc] = useCreateRatingMutation()
  const [updateRating] = useUpdateRatingMutation()

  if(isRatingError)
    return <Error error={ratingError} />
  
 

  useEffect(() => {
    if(isRatingSuccess && ratingData){
      refetch()
      setRating(ratingData?.value)

    }
  }, [isRatingSuccess, ratingData, refetch])

  const handleRating = async (rate: number) => {
    setRating(rate);

    if(rating && ratingData){
     
      await updateRating({id: ratingData?.id as string, update: {value: rate}})

    } else if(!rating) {
      await rateDoc({value: rate, doctorId: doctorId})
    }


  };

  return (
    <div>
      <div className='flex'>
      {Array.from({ length: totalStars }, (_, index) => {
        const starValue = index + 1;
        return (
          
           <span
            key={index}
            style={{
              fontSize: '2rem',
              color: starValue <= (hover || rating) ? '#ffc107' : '#e4e5e9',
              cursor: 'pointer',
            }}
            onClick={() => handleRating(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
          >
            ★
          </span>
          
         
        );

      })
     }
     </div>
    </div>
  );
};

export default RatingStars;

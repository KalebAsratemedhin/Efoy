const RatingDisplay = ({value}: {value: number}) => {
   
  
    return (
      <div>
        <div>
          {Array.from({ length: 5 }, (_, index) => {
            const starValue = index + 1;
            const fillPercentage = starValue <= value ? 100 : starValue - value > 0 && starValue - value < 1 ? (value % 1) * 100 : 0;
            
            return (
              <span
                key={index}
                style={{
                  fontSize: '2rem',
                  color: '#e4e5e9',
                  position: 'relative',
                  display: 'inline-block',
                  cursor: 'pointer',
                }}
              >
                
                    <span
                  style={{
                    width: `${fillPercentage}%`,
                    overflow: 'hidden',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    color: '#ffc107',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ★
                </span> 
                
                 ★
              </span>
            );
          })}
        </div>
      </div>
    );
  }
  
  export default RatingDisplay;
  
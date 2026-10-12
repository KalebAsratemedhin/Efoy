const RatingDisplay = ({ value }: { value: number }) => {
  return (
    <div className="flex items-center" aria-label={`Rating ${value} out of 5`}>
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const fillPercentage =
          starValue <= value
            ? 100
            : starValue - value > 0 && starValue - value < 1
              ? (value % 1) * 100
              : 0;

        return (
          <span
            key={index}
            className="relative inline-block text-lg leading-none"
            style={{ color: "#e2e8f0" }}
          >
            <span
              className="absolute top-0 left-0 overflow-hidden whitespace-nowrap"
              style={{ width: `${fillPercentage}%`, color: "#f59e0b" }}
            >
              ★
            </span>
            ★
          </span>
        );
      })}
    </div>
  );
};

export default RatingDisplay;

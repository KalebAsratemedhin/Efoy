import ErrorBoundary from '../components/appointments/ErrorBoundary';
import BookingPage from '../components/appointments/BookingPage';

const Book = () => (
  <ErrorBoundary>
    <BookingPage />
  </ErrorBoundary>
);

export default Book;
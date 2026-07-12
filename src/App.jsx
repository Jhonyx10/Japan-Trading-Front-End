import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BookingPage from './Pages/PublicPage/BookingPage';
import TrackBooking from './Pages/PublicPage/TrackBooking';

// 1. Lazy load the heavy navigation/pages
const HomePage = lazy(() => import('./Pages/HomePage'));
const AuthNavigation = lazy(() => import('./Navigations/AuthNavigation'));

function App() {
  return (
    <BrowserRouter>
      {/* 2. Suspense shows a fallback while the chunk is being downloaded */}
      <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/track" element={<TrackBooking />} />
          <Route path="/*" element={<AuthNavigation />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
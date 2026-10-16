import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Register from './pages/Register';
import Login from './pages/Login';
import LiftSearch from './LiftSearch';
import OfferLift from './pages/OfferLift';
import MyBookings from './pages/MyBookings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/lifts" element={<LiftSearch />} />
        <Route path="/offer-lift" element={<OfferLift />} />
        <Route path="/my-bookings" element={<MyBookings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
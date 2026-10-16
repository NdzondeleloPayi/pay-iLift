import { useState } from 'react';
import './Auth.css';
import { Link, useNavigate } from 'react-router-dom';

export default function OfferLift() {
  const navigate = useNavigate();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [availableSeats, setAvailableSeats] = useState('1');
  const [pricePerSeat, setPricePerSeat] = useState('0');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');

    const token = localStorage.getItem('payilift_token');

    if (!token) {
      navigate('/login');
      return;
    }

    const departureDate = new Date(departureTime);

    if (Number.isNaN(departureDate.getTime()) || departureDate <= new Date()) {
      setError('Please choose a departure time in the future.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5088/api/LiftOffers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          origin: origin.trim(),
          destination: destination.trim(),
          departureTimeUtc: departureDate.toISOString(),
          availableSeats: Number(availableSeats),
          pricePerSeat: Number(pricePerSeat),
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('payilift_token');
        localStorage.removeItem('payilift_user');
        return;
      }

      if (response.status === 403) {
        setError('Your account does not have permission to offer lifts. Please use a Driver or Both account.');
        return;
      }

      if (!response.ok) {
        setError(data?.message || 'Could not publish your lift. Please check your details and try again.');
        return;
      }

      setMessage('Your lift offer has been published successfully!');
      setOrigin('');
      setDestination('');
      setDepartureTime('');
      setAvailableSeats('1');
      setPricePerSeat('0');

      window.setTimeout(() => navigate('/lifts'), 1200);
    } catch {
      setError('Could not connect to the API. Please check that it is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Offer a Lift</h1>
        <p>Share your journey with commuters travelling in the same direction.</p>

        {message && <p role="status">{message}</p>}
        {error && <p role="alert">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="origin">Starting point</label>
          <input
            id="origin"
            type="text"
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
            placeholder="e.g. Gqeberha Central"
            maxLength={150}
            required
          />

          <label htmlFor="destination">Destination</label>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            placeholder="e.g. Coega Business Park"
            maxLength={150}
            required
          />

          <label htmlFor="departureTime">Departure date and time</label>
          <input
            id="departureTime"
            type="datetime-local"
            value={departureTime}
            onChange={(event) => setDepartureTime(event.target.value)}
            min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 16)}
            required
          />

          <label htmlFor="availableSeats">Available passenger seats</label>
          <input
            id="availableSeats"
            type="number"
            min="1"
            max="20"
            value={availableSeats}
            onChange={(event) => setAvailableSeats(event.target.value)}
            required
          />

          <label htmlFor="pricePerSeat">Price per seat (R)</label>
          <input
            id="pricePerSeat"
            type="number"
            min="0"
            max="100000"
            step="0.01"
            value={pricePerSeat}
            onChange={(event) => setPricePerSeat(event.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Publishing...' : 'Publish lift'}
          </button>
        </form>

        <p>
          Looking for a ride? <Link to="/lifts">Find a lift</Link>
        </p>
        <p>
          <Link to="/">Back to homepage</Link>
        </p>
      </section>
    </main>
  );
}
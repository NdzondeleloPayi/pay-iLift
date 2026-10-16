
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Booking {
  id: number;
  liftOfferId: number;
  seatsRequested: number;
  status: string;
  createdAtUtc: string;
  origin: string;
  destination: string;
  departureTimeUtc: string;
  pricePerSeat: number;
}

function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadBookings() {
      const token = localStorage.getItem('payilift_token');

      if (!token) {
        setError('Please log in to view your bookings.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          'http://localhost:5088/api/LiftBookings',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401 || response.status === 403) {
          setError('Your session may have expired. Please log in again.');
          return;
        }

        if (!response.ok) {
          throw new Error('Unable to load your bookings.');
        }

        const data: Booking[] = await response.json();
        setBookings(data);
      } catch {
        setError(
          'Could not connect to the booking service. Please check that the API is running.'
        );
      } finally {
        setLoading(false);
      }
    }

    void loadBookings();
  }, []);

  function formatDeparture(value: string) {
    return new Intl.DateTimeFormat('en-ZA', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Africa/Johannesburg',
    }).format(new Date(value));
  }

  function formatPrice(value: number) {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(value);
  }

  function statusColour(status: string) {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return '#176b45';
      case 'cancelled':
        return '#b42318';
      default:
        return '#946200';
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8faf8',
        color: '#17352b',
        fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
      }}
    >
      <header
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '20px 7%',
          background: '#fff',
          borderBottom: '1px solid #e6ebe7',
        }}
      >
        <Link
          to="/"
          style={{
            color: '#176b45',
            fontSize: '22px',
            fontWeight: 800,
            textDecoration: 'none',
          }}
        >
          Pay-iLift
        </Link>

        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '18px' }}>
          <Link to="/lifts" style={{ color: '#176b45' }}>
            Find a lift
          </Link>
          <Link to="/offer-lift" style={{ color: '#176b45' }}>
            Offer a lift
          </Link>
          <Link to="/my-bookings" style={{ color: '#176b45' }}>
            My Bookings
          </Link>
        </nav>
      </header>

      <main
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '48px 24px',
        }}
      >
        <p
          style={{
            color: '#176b45',
            fontWeight: 800,
            letterSpacing: '2px',
            fontSize: '12px',
          }}
        >
          YOUR JOURNEYS
        </p>

        <h1 style={{ fontSize: '36px', marginBottom: '12px' }}>
          My Bookings
        </h1>

        <p style={{ color: '#66766e', marginBottom: '28px' }}>
          View your requested lifts, departure times and booking statuses.
        </p>

        {loading && <p>Loading your bookings...</p>}

        {!loading && error && (
          <section
            role="alert"
            style={{
              padding: '24px',
              background: '#fff',
              border: '1px solid #e6ebe7',
              borderRadius: '14px',
            }}
          >
            <p style={{ color: '#b42318' }}>{error}</p>
            <Link to="/login" style={{ color: '#176b45' }}>
              Go to login
            </Link>
          </section>
        )}

        {!loading && !error && bookings.length === 0 && (
          <section
            style={{
              padding: '32px',
              background: '#fff',
              border: '1px solid #e6ebe7',
              borderRadius: '14px',
            }}
          >
            <h2>No bookings yet</h2>
            <p style={{ color: '#66766e' }}>
              Find a lift that suits your journey and your schedule.
            </p>
            <Link to="/lifts" style={{ color: '#176b45' }}>
              Browse available lifts
            </Link>
          </section>
        )}

        {!loading && !error && bookings.length > 0 && (
          <section
            style={{
              display: 'grid',
              gap: '20px',
            }}
          >
            {bookings.map((booking) => (
              <article
                key={booking.id}
                style={{
                  padding: '24px',
                  background: '#fff',
                  border: '1px solid #e6ebe7',
                  borderRadius: '14px',
                  boxShadow: '0 8px 24px rgb(28 70 45 / 5%)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <p style={{ color: '#176b45', fontWeight: 700 }}>
                    Booking #{booking.id}
                  </p>

                  <span
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: '#f2f4f2',
                      color: statusColour(booking.status),
                      fontWeight: 700,
                      fontSize: '13px',
                    }}
                  >
                    {booking.status}
                  </span>
                </div>

                <h2 style={{ fontSize: '23px', margin: '8px 0 20px' }}>
                  {booking.origin} {' → '} {booking.destination}
                </h2>

                <p>
                  <strong>Departure:</strong>{' '}
                  {formatDeparture(booking.departureTimeUtc)}
                </p>

                <p>
                  <strong>Seats requested:</strong>{' '}
                  {booking.seatsRequested}
                </p>

                <p>
                  <strong>Price per seat:</strong>{' '}
                  {formatPrice(booking.pricePerSeat)}
                </p>

                <p>
                  <strong>Total lift cost:</strong>{' '}
                  {formatPrice(
                    booking.pricePerSeat * booking.seatsRequested
                  )}
                </p>

                <p style={{ color: '#66766e', fontSize: '12px' }}>
                  Lift offer #{booking.liftOfferId}
                </p>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default MyBookings;

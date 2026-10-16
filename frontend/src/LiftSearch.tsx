
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

interface LiftOffer {
  id: number;
  driverId: number;
  origin: string;
  destination: string;
  departureTimeUtc: string;
  availableSeats: number;
  pricePerSeat: number;
  status: string;
}

interface BookingResponse {
  id?: number;
  status?: string;
  remainingSeats?: number;
  message?: string;
}

function LiftSearch() {
  const [offers, setOffers] = useState<LiftOffer[]>([]);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingOfferId, setBookingOfferId] = useState<number | null>(null);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState(false);
  const [lastBookedOfferId, setLastBookedOfferId] = useState<number | null>(
    null
  );

  useEffect(() => {
    async function loadOffers() {
      try {
        const response = await fetch(
          'http://localhost:5088/api/LiftOffers'
        );

        if (!response.ok) {
          throw new Error('Unable to load lift offers.');
        }

        const data: LiftOffer[] = await response.json();
        setOffers(data);
      } catch {
        setError(
          'Could not connect to the lift service. Please check that the API is running.'
        );
      } finally {
        setLoading(false);
      }
    }

    void loadOffers();
  }, []);

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const matchesOrigin = offer.origin
        .toLowerCase()
        .includes(origin.trim().toLowerCase());

      const matchesDestination = offer.destination
        .toLowerCase()
        .includes(destination.trim().toLowerCase());

      return matchesOrigin && matchesDestination;
    });
  }, [offers, origin, destination]);

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

  async function handleBooking(liftOfferId: number) {
    setBookingMessage('');
    setBookingError(false);
    setLastBookedOfferId(null);

    const token = localStorage.getItem('payilift_token');

    if (!token) {
      setBookingError(true);
      setBookingMessage('Please log in before booking a lift.');
      return;
    }

    setBookingOfferId(liftOfferId);

    try {
      const response = await fetch(
        'http://localhost:5088/api/LiftBookings',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            liftOfferId,
            seatsRequested: 1,
          }),
        }
      );

      const result: BookingResponse | null = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        setBookingError(true);
        setBookingMessage(
          result?.message ||
            (response.status === 401 || response.status === 403
              ? 'Your session may have expired, or your account cannot book lifts. Please log in with a passenger account.'
              : 'Unable to book this lift. Please try again.')
        );
        return;
      }

      setLastBookedOfferId(liftOfferId);
      setBookingMessage(
        `Booking #${result?.id} created successfully. Status: ${result?.status}. Seats remaining: ${result?.remainingSeats}.`
      );

      // Refresh the lift list so the displayed seats reflect the API.
      const offersResponse = await fetch(
        'http://localhost:5088/api/LiftOffers'
      );

      if (offersResponse.ok) {
        const updatedOffers: LiftOffer[] = await offersResponse.json();
        setOffers(updatedOffers);
      }
    } catch {
      setBookingError(true);
      setBookingMessage(
        'Could not connect to the booking service. Please check that the API is running.'
      );
    } finally {
      setBookingOfferId(null);
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

        <nav
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '18px',
          }}
        >
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
          maxWidth: '1100px',
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
          YOUR NEXT JOURNEY
        </p>

        <h1 style={{ fontSize: '36px', marginBottom: '12px' }}>
          Find a lift
        </h1>

        <p style={{ color: '#66766e', marginBottom: '28px' }}>
          Search available lifts and find a route that works for you.
        </p>

        {bookingMessage && (
          <div
            role={bookingError ? 'alert' : 'status'}
            style={{
              padding: '14px',
              marginBottom: '20px',
              borderRadius: '8px',
              background: bookingError ? '#fef3f2' : '#ecfdf3',
              color: bookingError ? '#b42318' : '#176b45',
            }}
          >
            <p style={{ margin: 0 }}>{bookingMessage}</p>

            {bookingError &&
              !localStorage.getItem('payilift_token') && (
                <Link
                  to="/login"
                  style={{
                    display: 'inline-block',
                    marginTop: '8px',
                    color: '#176b45',
                    fontWeight: 700,
                  }}
                >
                  Log in
                </Link>
              )}

            {!bookingError && (
              <p style={{ margin: '10px 0 0' }}>
                <Link
                  to="/my-bookings"
                  style={{
                    color: '#176b45',
                    fontWeight: 700,
                  }}
                >
                  View My Bookings
                </Link>
              </p>
            )}
          </div>
        )}

        <section
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            padding: '24px',
            background: '#fff',
            border: '1px solid #e6ebe7',
            borderRadius: '14px',
            marginBottom: '32px',
          }}
        >
          <label style={{ flex: '1 1 220px' }}>
            <span style={{ display: 'block', marginBottom: '8px' }}>
              From
            </span>
            <input
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
              placeholder="e.g. Mount Road"
              style={{
                width: '100%',
                padding: '13px',
                border: '1px solid #cbd9cf',
                borderRadius: '8px',
              }}
            />
          </label>

          <label style={{ flex: '1 1 220px' }}>
            <span style={{ display: 'block', marginBottom: '8px' }}>
              To
            </span>
            <input
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              placeholder="e.g. Summerstrand"
              style={{
                width: '100%',
                padding: '13px',
                border: '1px solid #cbd9cf',
                borderRadius: '8px',
              }}
            />
          </label>

          <button
            type="button"
            onClick={() => {
              setOrigin('');
              setDestination('');
            }}
            style={{
              alignSelf: 'end',
              padding: '13px 20px',
              border: '1px solid #176b45',
              borderRadius: '8px',
              background: '#176b45',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Clear filters
          </button>
        </section>

        {loading && <p>Loading available lifts...</p>}

        {!loading && error && (
          <p role="alert" style={{ color: '#b42318' }}>
            {error}
          </p>
        )}

        {!loading && !error && filteredOffers.length === 0 && (
          <section
            style={{
              padding: '32px',
              background: '#fff',
              border: '1px solid #e6ebe7',
              borderRadius: '14px',
            }}
          >
            <h2>No matching lifts yet</h2>
            <p style={{ color: '#66766e' }}>
              Try a different route or check again later as drivers publish
              offers.
            </p>
          </section>
        )}

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredOffers.map((offer) => (
            <article
              key={offer.id}
              style={{
                padding: '24px',
                background: '#fff',
                border: '1px solid #e6ebe7',
                borderRadius: '14px',
                boxShadow: '0 8px 24px rgb(28 70 45 / 5%)',
              }}
            >
              <p style={{ color: '#176b45', fontWeight: 700 }}>
                Available lift
              </p>

              <h2 style={{ fontSize: '20px' }}>
                {offer.origin} {' → '} {offer.destination}
              </h2>

              <p>
                <strong>Departure:</strong>{' '}
                {formatDeparture(offer.departureTimeUtc)}
              </p>

              <p>
                <strong>Available seats:</strong> {offer.availableSeats}
              </p>

              <p>
                <strong>Price per seat:</strong>{' '}
                {formatPrice(offer.pricePerSeat)}
              </p>

              <p style={{ color: '#66766e', fontSize: '12px' }}>
                Offer #{offer.id}
              </p>

              {lastBookedOfferId === offer.id && !bookingError ? (
                <Link
                  to="/my-bookings"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    marginTop: '12px',
                    padding: '13px 20px',
                    borderRadius: '8px',
                    background: '#e8f5ec',
                    color: '#176b45',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  View your booking
                </Link>
              ) : (
                <button
                  type="button"
                  disabled={
                    bookingOfferId !== null || offer.availableSeats < 1
                  }
                  onClick={() => void handleBooking(offer.id)}
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '13px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    background:
                      bookingOfferId === offer.id
                        ? '#8aa99a'
                        : '#176b45',
                    color: '#fff',
                    fontWeight: 700,
                    cursor:
                      bookingOfferId !== null || offer.availableSeats < 1
                        ? 'not-allowed'
                        : 'pointer',
                    opacity: offer.availableSeats < 1 ? 0.6 : 1,
                  }}
                >
                  {bookingOfferId === offer.id
                    ? 'Booking...'
                    : offer.availableSeats < 1
                      ? 'No seats available'
                      : 'Book this lift'}
                </button>
              )}
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export default LiftSearch;

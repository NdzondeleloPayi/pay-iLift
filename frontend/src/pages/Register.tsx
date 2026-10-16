import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

function Register() {
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage('');
    setIsError(false);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
  fullName: String(formData.get('fullName') ?? '').trim(),
  email: String(formData.get('email') ?? '').trim(),
  phoneNumber: String(formData.get('phone') ?? '').trim(),
  password: String(formData.get('password') ?? ''),
  role: String(formData.get('role') ?? ''),
};

    try {
      const response = await fetch('http://localhost:5088/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setIsError(true);
        setMessage(
          result.message ?? 'Registration failed. Please check your details.',
        );
        return;
      }

      setMessage(
        'Your account has been created successfully! You can now log in.',
      );
      form.reset();
    } catch {
      setIsError(true);
      setMessage(
        'Unable to connect to Pay-iLift. Please check that the API is running and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          Pay-iLift
        </Link>

        <h1>Create your account</h1>
        <p className="auth-subtitle">
          Join your community and make your daily commute easier.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Enter your full name"
            autoComplete="name"
            maxLength={100}
            required
          />

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            maxLength={254}
            required
          />

          <label htmlFor="phone">Phone number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="e.g. 082 123 4567"
            autoComplete="tel"
            maxLength={20}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            minLength={8}
            required
          />

          <label htmlFor="role">I want to use Pay-iLift as a</label>
          <select id="role" name="role" defaultValue="" required>
            <option value="" disabled>
              Select your role
            </option>
            <option value="passenger">Passenger</option>
            <option value="driver">Driver</option>
            <option value="both">Both driver and passenger</option>
          </select>

          {message && (
            <p
              role="status"
              aria-live="polite"
              style={{
                color: isError ? '#b42318' : '#18794e',
                marginTop: '12px',
              }}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>

        <Link to="/" className="back-home">
          Back to homepage
        </Link>
      </div>
    </main>
  );
}

export default Register;
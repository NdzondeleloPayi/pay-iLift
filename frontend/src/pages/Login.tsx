
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

interface LoginResponse {
  message: string;
  token: string;
  expiresAtUtc: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    role: string;
  };
}

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch(
        'http://localhost:5088/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          data.message || 'Login failed. Please try again.'
        );
        return;
      }

      const loginData = data as LoginResponse;

      // Keep the token for authenticated API requests.
      localStorage.setItem('payilift_token', loginData.token);
      localStorage.setItem(
        'payilift_user',
        JSON.stringify(loginData.user)
      );

      navigate('/');
    } catch {
      setErrorMessage(
        'Unable to connect to Pay-iLift. Please check that the API is running.'
      );
    } finally {
      setIsSubmitting(false);
      setPassword('');
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          Pay-iLift
        </Link>

        <h1>Welcome back</h1>
        <p className="auth-subtitle">
          Log in to continue your commute journey.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {errorMessage && (
            <p role="alert" className="auth-error">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Create an account</Link>
        </p>

        <Link to="/" className="back-home">
          Back to homepage
        </Link>
      </div>
    </main>
  );
}

export default Login;

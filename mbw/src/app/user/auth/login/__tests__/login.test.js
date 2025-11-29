// src/app/user/auth/login/__tests__/login.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/user/auth/login/page';
import axios from 'axios';

// ----- Mocks we want to observe -----
const pushMock = jest.fn();
const setIsLoggedInMock = jest.fn();
const setNavContextMock = jest.fn();
let isDarkModeMock = false;

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Mock your app context hook, using the controllable mocks above
jest.mock('@/app/appContext', () => ({
  useAppContext: () => ({
    setIsLoggedIn: setIsLoggedInMock,
    setNavContext: setNavContextMock,
    isDarkMode: isDarkModeMock,
  }),
}));

// Mock normalizeError to return a friendly message
const normalizeErrorMock = jest.fn(() => ({
  status: 401,
  message: 'Invalid credentials',
}));
jest.mock('@/helpers/newErrorHandler', () => ({
  normalizeError: (...args) => normalizeErrorMock(...args),
}));

jest.mock('axios');

beforeEach(() => {
  jest.clearAllMocks();
  isDarkModeMock = false; // default to light mode
});

test('renders login page and has disabled submit initially', () => {
  render(<LoginPage />);

  // heading is present
  expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();

  // submit button is disabled before typing
  expect(screen.getByRole('button', { name: /login/i })).toBeDisabled();
});

test('enables submit after typing email and password', () => {
  render(<LoginPage />);

  const email = screen.getByLabelText(/email/i);
  const password = screen.getByLabelText(/password/i);
  const button = screen.getByRole('button', { name: /login/i });

  expect(button).toBeDisabled();

  fireEvent.change(email, { target: { value: 'a@b.com' } });
  fireEvent.change(password, { target: { value: 'secret' } });

  expect(button).toBeEnabled();
});

test('does not submit when disabled (no email/password)', () => {
  render(<LoginPage />);

  const button = screen.getByRole('button', { name: /login/i });

  // still disabled, click should be a no-op for onLogin
  fireEvent.click(button);

  expect(axios.post).not.toHaveBeenCalled();
});

test('shows loading state while request is in flight', async () => {
  // Keep the promise pending so loading stays true
  axios.post.mockImplementation(
    () => new Promise(() => {}) // never resolves
  );

  render(<LoginPage />);

  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'a@b.com' },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'secret' },
  });

  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  // Button should switch to "Signing in…" and be disabled
  expect(
    screen.getByRole('button', { name: /signing in/i })
  ).toBeDisabled();
});

test('successful login calls setIsLoggedIn and navigates', async () => {
  axios.post.mockResolvedValueOnce({
    data: { ok: true },
  });

  render(<LoginPage />);

  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'a@b.com' },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'secret' },
  });

  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  await waitFor(() => {
    expect(setIsLoggedInMock).toHaveBeenCalledWith(true);
    expect(pushMock).toHaveBeenCalledWith('/user/myBikes');
  });

  // After success, button text goes back to "Login"
  expect(
    screen.getByRole('button', { name: /login/i })
  ).toBeInTheDocument();

  // No error message
  expect(screen.queryByText(/invalid credentials/i)).toBeNull();
});

test('shows an error message when login fails', async () => {
  const err = new Error('network or auth error');
  axios.post.mockRejectedValueOnce(err);

  render(<LoginPage />);

  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'a@b.com' },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'secret' },
  });
  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  // waits for state update after the catch block
  await waitFor(() =>
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
  );

  // make sure normalizeError got the error
  expect(normalizeErrorMock).toHaveBeenCalledWith(err);
});

test('calls setNavContext with "login" on mount', () => {
  render(<LoginPage />);

  expect(setNavContextMock).toHaveBeenCalledWith('login');
});

test('renders correctly in dark mode (no bg-white/text-black classes)', () => {
  // flip the dark mode branch
  isDarkModeMock = true;

  render(<LoginPage />);

  // No bg-white elements should exist in dark mode
  const bgWhiteElements = document.querySelectorAll('.bg-white');
  expect(bgWhiteElements.length).toBe(0);

  // Heading should not have text-black class in dark mode
  const heading = screen.getByRole('heading', { name: /log in/i });
  expect(heading.className).not.toMatch(/text-black/);
});

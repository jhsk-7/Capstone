// src/app/user/auth/signup/__tests__/signup.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignupPage from '@/app/user/auth/signup/page';
import axios from 'axios';

// --- controllable mocks ---
const pushMock = jest.fn();
const setNavContextMock = jest.fn();
let isDarkModeMock = false;

// mock axios so we can control responses
jest.mock('axios');

// mock router
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

// mock app context
jest.mock('@/app/appContext', () => ({
  useAppContext: () => ({
    setNavContext: setNavContextMock,
    isDarkMode: isDarkModeMock,
  }),
}));

// mock normalizeError so we can drive error branch
const normalizeErrorMock = jest.fn(() => ({
  status: 400,
  message: 'Email already in use',
}));
jest.mock('@/helpers/newErrorHandler', () => ({
  normalizeError: (...args) => normalizeErrorMock(...args),
}));

beforeEach(() => {
  jest.clearAllMocks();
  isDarkModeMock = false; // default light mode
});

test('renders sign up page and has disabled submit initially', () => {
  render(<SignupPage />);

  // heading
  expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();

  // submit button disabled before typing
  expect(screen.getByRole('button', { name: /sign up/i })).toBeDisabled();
});

test('enables submit after typing username, email and password', () => {
  render(<SignupPage />);

  const username = screen.getByLabelText(/username/i);
  const email = screen.getByLabelText(/email/i);
  const password = screen.getByLabelText(/password/i);
  const button = screen.getByRole('button', { name: /sign up/i });

  expect(button).toBeDisabled();

  fireEvent.change(username, { target: { value: 'testuser' } });
  fireEvent.change(email, { target: { value: 'a@b.com' } });
  fireEvent.change(password, { target: { value: 'secret' } });

  expect(button).toBeEnabled();
});

// exercise the isDisabled guard: early return + no axios call
test('does not submit when form is disabled', () => {
  const { container } = render(<SignupPage />);

  // leave fields blank so isDisabled remains true
  const form = container.querySelector('form');
  expect(form).not.toBeNull();

  // onSubmit should run, but early-return in onSignup prevents axios.post
  fireEvent.submit(form);

  expect(axios.post).not.toHaveBeenCalled();
});

test('successful signup navigates to /user/addBike', async () => {
  axios.post.mockResolvedValueOnce({ data: { ok: true } });

  render(<SignupPage />);

  // Fill required fields
  fireEvent.change(screen.getByLabelText(/username/i), {
    target: { value: 'testuser' },
  });
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'a@b.com' },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'secret' },
  });

  // Submit (button has onClick + form onSubmit)
  fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

  // Wait for navigation after axios resolves
  await waitFor(() => {
    expect(pushMock).toHaveBeenCalledWith('/user/addBike');
  });

  // Button returns to "Sign up" (loading false after finally)
  expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
});

test('shows loading state while request is in flight', () => {
  // Keep promise pending so loading stays true
  axios.post.mockImplementation(
    () => new Promise(() => {}) // never resolves
  );

  render(<SignupPage />);

  fireEvent.change(screen.getByLabelText(/username/i), {
    target: { value: 'testuser' },
  });
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'a@b.com' },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'secret' },
  });

  fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

  // Button switches to "Creating account…" and is disabled
  const loadingButton = screen.getByRole('button', {
    name: /creating account…/i,
  });
  expect(loadingButton).toBeDisabled();
});

test('shows an error message when signup fails', async () => {
  const err = new Error('network or validation error');
  axios.post.mockRejectedValueOnce(err);

  render(<SignupPage />);

  fireEvent.change(screen.getByLabelText(/username/i), {
    target: { value: 'testuser' },
  });
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'a@b.com' },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'secret' },
  });

  fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

  // Wait for error message from normalizeError
  await waitFor(() =>
    expect(
      screen.getByText(/email already in use/i)
    ).toBeInTheDocument()
  );

  expect(normalizeErrorMock).toHaveBeenCalledWith(err);

  // After error, loading is false again → button text back to "Sign up"
  expect(screen.getByRole('button', { name: /sign up/i })).toBeEnabled();
});

test('calls setNavContext with "signup" on mount', () => {
  render(<SignupPage />);

  expect(setNavContextMock).toHaveBeenCalledWith('signup');
});

test('renders correctly in dark mode (no bg-white or text-gray-900)', () => {
  // flip the dark mode branch
  isDarkModeMock = true;

  render(<SignupPage />);

  // No bg-white containers in dark mode
  const bgWhiteElements = document.querySelectorAll('.bg-white');
  expect(bgWhiteElements.length).toBe(0);

  // Heading should not have text-gray-900 class
  const heading = screen.getByRole('heading', { name: /sign up/i });
  expect(heading.className).not.toMatch(/text-gray-900/);
});

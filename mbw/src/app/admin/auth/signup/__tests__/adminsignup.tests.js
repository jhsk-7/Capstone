import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminSignup from '@/app/admin/auth/signup/page';
import axios from 'axios';

// mock axios so we can control responses
jest.mock('axios');

// capture the router push to assert navigation
const pushMock = jest.fn();

// allow toggling dark mode per test
let mockIsDarkMode = false;

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

// mock your app context
jest.mock('@/app/appContext', () => ({
  useAppContext: () => ({
    setNavContext: jest.fn(),
    isDarkMode: mockIsDarkMode,
  }),
}));

// mock normalizeError so we can check error branch
const normalizeErrorMock = jest.fn(() => ({
  status: 400,
  message: 'Signup failed',
}));
jest.mock('@/helpers/newErrorHandler', () => ({
  normalizeError: (...args) => normalizeErrorMock(...args),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockIsDarkMode = false;
});


test('renders sign up page and has disabled submit initially', () => {
  render(<AdminSignup />);

  // heading
  expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();

  // submit button disabled before typing
  expect(screen.getByRole('button', { name: /sign up/i })).toBeDisabled();
});


test('enables submit after typing email and password', () => {
  render(<AdminSignup />);

  const username = screen.getByLabelText(/username/i);
  const email = screen.getByLabelText(/email/i);
  const password = screen.getByLabelText(/password/i);
  const secret = screen.getByLabelText(/secret code/i);
  const button = screen.getByRole('button', { name: /sign up/i });

  expect(button).toBeDisabled();

  fireEvent.change(username, { target: { value: 'testuser' } });
  fireEvent.change(email, { target: { value: 'a@b.com' } });
  fireEvent.change(password, { target: { value: 'secret' } });
  fireEvent.change(secret, { target: { value: 'anothersecret' } });

  expect(button).toBeEnabled();
});


test('successful signup navigates to /admin/auth/login', async () => {
  axios.post.mockResolvedValueOnce({ data: { ok: true } });

  render(<AdminSignup />);

  // Fill required fields
  fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } });
  fireEvent.change(screen.getByLabelText(/secret code/i), { target: { value: 'secret' } });

  // Submit
  fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

  // Wait for navigation after axios resolves
  await screen.findByRole('button', { name: /sign up/i }); // ensures re-render happened
  expect(pushMock).toHaveBeenCalledWith('/admin/auth/login');
});


test('renders correctly in dark mode (isDarkMode=true)', () => {
  mockIsDarkMode = true;

  render(<AdminSignup />);

  // Still renders the heading; main purpose is to execute ternaries with isDarkMode = true
  expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();

  // Button is still disabled initially in dark mode
  expect(screen.getByRole('button', { name: /sign up/i })).toBeDisabled();
});

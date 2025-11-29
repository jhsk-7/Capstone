// src/app/user/auth/login/__tests__/login.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminLogin from '@/app/admin/auth/login/page';
import axios from 'axios';

const pushMock = jest.fn();
const setNavContextMock = jest.fn();
const setIsAdminLoggedInMock = jest.fn();
let mockIsDarkMode = false;

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Mock your app context hook
jest.mock('@/app/appContext', () => ({
  useAppContext: () => ({
    setIsLoggedIn: jest.fn(),           // not used here, but harmless
    setIsAdminLoggedIn: setIsAdminLoggedInMock,
    setNavContext: setNavContextMock,
    isDarkMode: mockIsDarkMode,
  }),
}));

// Mock normalizeError to return a friendly message
jest.mock('@/helpers/newErrorHandler', () => ({
  normalizeError: jest.fn(() => ({ status: 401, message: 'Invalid credentials' })),
}));

jest.mock('axios');

beforeEach(() => {
  jest.clearAllMocks();
});


test('renders login page and has disabled submit initially', () => {
  render(<AdminLogin />);

  // heading is present
  expect(
    screen.getByRole('heading', { name: /admin log in/i })
  ).toBeInTheDocument();

  // submit button is disabled before typing
  expect(
    screen.getByRole('button', { name: /login/i })
  ).toBeDisabled();
});

// Mock normalizeError to return a friendly message
jest.mock('@/helpers/newErrorHandler', () => ({
  normalizeError: jest.fn(() => ({ status: 401, message: 'Invalid credentials' })),
}));

jest.mock('axios');

test('enables submit after typing email and password', () => {
  render(<AdminLogin />);

  const email = screen.getByLabelText(/email/i);
  const password = screen.getByLabelText(/password/i);
  const button = screen.getByRole('button', { name: /login/i });

  expect(button).toBeDisabled();

  fireEvent.change(email, { target: { value: 'a@b.com' } });
  fireEvent.change(password, { target: { value: 'secret' } });

  expect(button).toBeEnabled();
});

test('shows an error message when login fails', async () => {
  axios.post.mockRejectedValueOnce(new Error('network or auth error'));

  render(<AdminLogin />);

  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } });
  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  // waits for state update after the catch block
  await waitFor(() =>
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
  );
});


test('sets nav context to adminLogin on mount', () => {
  render(<AdminLogin />);

  expect(setNavContextMock).toHaveBeenCalledWith('adminLogin');
});


test('does not submit when form is submitted while disabled', () => {
  const { container } = render(<AdminLogin />);

  // form submit with empty fields -> isDisabled true inside onLogin
  const form = container.querySelector('form');
  fireEvent.submit(form);

  // axios.post should never be called
  expect(axios.post).not.toHaveBeenCalled();
});


test('successful login sets admin flag, shows loading text, and navigates', async () => {
  axios.post.mockResolvedValueOnce({
    data: { message: 'Welcome admin' },
  });

  // mock alert so we can assert on it
  const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

  render(<AdminLogin />);

  // Fill out the form
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'admin@example.com' },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'secret' },
  });

  const button = screen.getByRole('button', { name: /login/i });
  expect(button).toBeEnabled();

  fireEvent.click(button);

  // While loading, button should show "Signing in…"
  expect(
    screen.getByRole('button', { name: /signing in…/i })
  ).toBeInTheDocument();

  // Wait for axios.post to be called with correct arguments
  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith(
      '/api/admin/adminAuth/login',
      { email: 'admin@example.com', password: 'secret' },
      { withCredentials: true }
    );
  });

  // setIsAdminLoggedIn should be set to true
  expect(setIsAdminLoggedInMock).toHaveBeenCalledWith(true);

  // alert should show backend message
  expect(alertSpy).toHaveBeenCalledWith('Welcome admin');

  // router.push to /admin/services
  expect(pushMock).toHaveBeenCalledWith('/admin/services');

  alertSpy.mockRestore();
});


test('renders correctly in dark mode (isDarkMode=true)', () => {
  mockIsDarkMode = true;

  render(<AdminLogin />);

  // Still renders the heading (we mainly care that render doesn’t crash)
  expect(
    screen.getByRole('heading', { name: /admin log in/i })
  ).toBeInTheDocument();

  // Button is still disabled initially in dark mode
  expect(
    screen.getByRole('button', { name: /login/i })
  ).toBeDisabled();
});

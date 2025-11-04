// src/app/user/auth/login/__tests__/login.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/user/auth/login/page';
import axios from 'axios';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock your app context hook
jest.mock('@/app/appContext', () => ({
  useAppContext: () => ({
    setIsLoggedIn: jest.fn(),
    setNavContext: jest.fn(),
    isDarkMode: false,
  }),
}));

test('renders login page and has disabled submit initially', () => {
  render(<LoginPage />);

  // heading is present
  expect(
    screen.getByRole('heading', { name: /log in/i })
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
  render(<LoginPage />);

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

  render(<LoginPage />);

  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } });
  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  // waits for state update after the catch block
  await waitFor(() =>
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
  );
});
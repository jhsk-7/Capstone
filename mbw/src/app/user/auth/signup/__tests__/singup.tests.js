// src/app/user/auth/signup/__tests__/signup.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import SignupPage from '@/app/user/auth/signup/page';
import axios from 'axios';

// mock axios so we can control responses
jest.mock('axios');

// capture the router push to assert navigation
const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

// mock your app context
jest.mock('@/app/appContext', () => ({
  useAppContext: () => ({
    setIsHome: jest.fn(),
    isDarkMode: false,
  }),
}));

test('renders sign up page and has disabled submit initially', () => {
  render(<SignupPage />);

  // heading
  expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();

  // submit button disabled before typing
  expect(screen.getByRole('button', { name: /sign up/i })).toBeDisabled();
});


test('enables submit after typing email and password', () => {
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


test('successful signup navigates to /user/addBike', async () => {
  axios.post.mockResolvedValueOnce({ data: { ok: true } });

  render(<SignupPage />);

  // Fill required fields
  fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } });

  // Submit
  fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

  // Wait for navigation after axios resolves
  await screen.findByRole('button', { name: /sign up/i }); // ensures re-render happened
  expect(pushMock).toHaveBeenCalledWith('/user/addBike');
});
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import AddBikeForm from '@/app/user/addBike/page'; // adjust path if needed

jest.mock('axios');

jest.mock('@/helpers/newErrorHandler', () => ({
  normalizeError: () => ({ status: 400, message: 'Failed to add bike' }),
}));

const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

test('submits and shows success message', async () => {
  axios.post.mockResolvedValueOnce({ data: { ok: true } });

  render(<AddBikeForm />);

  await userEvent.type(screen.getByLabelText(/nickname/i), 'Roadster');
  await userEvent.type(screen.getByLabelText(/color/i), 'Blue');

  await userEvent.click(screen.getByRole('button', { name: /add bike/i }));

  expect(
    await screen.findByText(/✅\s*bike added successfully!/i)
  ).toBeInTheDocument();
});


test('shows error message when submit fails', async () => {
  axios.post.mockRejectedValueOnce(new Error('boom'));

  render(<AddBikeForm />);

  await userEvent.type(screen.getByLabelText(/nickname/i), 'Roadster');
  await userEvent.type(screen.getByLabelText(/color/i), 'Blue');
  await userEvent.click(screen.getByRole('button', { name: /add bike/i }));

  expect(await screen.findByText(/failed to add bike/i)).toBeInTheDocument();
});
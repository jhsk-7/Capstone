import { render, screen, fireEvent } from '@testing-library/react';
import MyAppointmentsPage from '@/app/admin/appointments/page';
import axios from 'axios';

jest.mock('axios');

const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

test('loads appointments and navigates to detail when a card is clicked', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      appointments: [
        {
          _id: 'abc123',
          date: '2025-09-30T00:00:00.000Z',
          status: 'Pending',
          bikes: [],
          userId: { username: 'Jordan' },
        },
      ],
    },
  });

  render(<MyAppointmentsPage />);

  // Wait for content (status pill) to appear, meaning loading finished
  expect(await screen.findByText(/pending/i)).toBeInTheDocument();

  // Click the appointment "card" (it's rendered as a role="button")
  const card = screen.getByRole('button', { name: /open appointment/i });
  fireEvent.click(card);

  // Should navigate to the detail route for that id
  expect(pushMock).toHaveBeenCalledWith('./appointments/abc123');
});


test('shows empty state when there are no appointments', async () => {
  axios.get.mockResolvedValueOnce({ data: { appointments: [] } });

  render(<MyAppointmentsPage />);

  // After loading, it should show the empty message
  expect(await screen.findByText(/no appointments yet/i)).toBeInTheDocument();

  // No clickable appointment cards should be present
  expect(screen.queryByRole('button', { name: /open appointment/i })).toBeNull();
});


jest.mock('@/helpers/newErrorHandler', () => ({
  normalizeError: () => ({ message: 'Could not load appointments' }),
}));

test('shows error message when fetching appointments fails', async () => {
  axios.get.mockRejectedValueOnce(new Error('network down'));

  render(<MyAppointmentsPage />);

  // error banner shows the normalizeError message
  expect(
    await screen.findByText(/could not load appointments/i)
  ).toBeInTheDocument();
});
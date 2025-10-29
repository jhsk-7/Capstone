import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MyAppointmentsPage from '@/app/user/appointment/myAppointments/page';

jest.mock('axios');
const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

test('shows empty state when there are no appointments', async () => {
  axios.get.mockResolvedValueOnce({ data: { appointments: [] } });

  render(<MyAppointmentsPage />);

  // After loading finishes, the empty message appears
  expect(await screen.findByText(/no appointments yet/i)).toBeInTheDocument();
});



test('navigates to appointment detail when a card is clicked', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      appointments: [
        {
          _id: 'a1',
          date: '2025-09-30T00:00:00.000Z',
          status: 'Pending',
          bikes: [],
        },
      ],
    },
  });

  render(<MyAppointmentsPage />);

  // wait for the card to appear (aria-label starts with "Open appointment on ...")
  const card = await screen.findByRole('button', { name: /open appointment/i });

  await userEvent.click(card);

  expect(pushMock).toHaveBeenCalledWith('./myAppointments/a1');
});


test('card shows bike nickname and joined service names', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      appointments: [
        {
          _id: 'a1',
          date: '2025-09-30T00:00:00.000Z',
          status: 'Pending',
          bikes: [
            {
              bikeId: { _id: 'b1', nickname: 'Roadster' },
              services: [{ _id: 's1', name: 'Wash' }, { _id: 's2', name: 'Tune' }],
            },
          ],
        },
      ],
    },
  });

  render(<MyAppointmentsPage />);

  // Get the specific appointment card by its accessible name
  const card = await screen.findByRole('button', { name: /open appointment/i });

  // Assert text within that card only (avoids multiple-element matches)
  expect(card).toHaveTextContent(/Bike:\s*Roadster/i);
  expect(card).toHaveTextContent(/Services:\s*Wash,\s*Tune/i);
});


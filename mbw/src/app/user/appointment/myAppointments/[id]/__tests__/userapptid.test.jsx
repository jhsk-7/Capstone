import { render, screen } from '@testing-library/react';
import axios from 'axios';

jest.mock('axios');
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'a1' }),
}));

import AppointmentDetailPage from '@/app/user/appointment/myAppointments/[id]/page';

test('renders appointment detail after loading', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        date: '2025-09-30T00:00:00.000Z',
        status: 'Pending',
        bikes: [],                 // triggers "No bike/services detail"
        createdAt: '2025-09-01T00:00:00.000Z',
        updatedAt: '2025-09-10T00:00:00.000Z',
      },
    },
  });

  render(<AppointmentDetailPage />);

  // Wait for loaded content
  expect(await screen.findByText(/no bike\/services detail/i)).toBeInTheDocument();

  // Heading appears
  expect(screen.getByRole('heading', { name: /appointment/i })).toBeInTheDocument();

  // Back link (accessible name comes from aria-label)
  expect(
    screen.getByRole('link', { name: /go to my appointments/i })
  ).toBeInTheDocument();

  // Status pill text
  expect(screen.getByText(/pending/i)).toBeInTheDocument();
});



test('shows bike nickname and joined service names', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        date: '2025-09-30T00:00:00.000Z',
        status: 'Pending',
        bikes: [
          {
            bikeId: { _id: 'b1', nickname: 'Roadster' },
            services: [{ _id: 's1', name: 'Wash' }, { _id: 's2', name: 'Tune' }],
          },
        ],
        createdAt: '2025-09-01T00:00:00.000Z',
        updatedAt: '2025-09-10T00:00:00.000Z',
      },
    },
  });

  render(<AppointmentDetailPage />);

  // Find the "Bike:" label span, then assert on its containing row’s combined text
  const bikeLabel = await screen.findByText('Bike:', { selector: 'span' });
  const row = bikeLabel.closest('div');
  expect(row).toHaveTextContent(/Bike:\s*Roadster\s*-\s*Services:\s*Wash,\s*Tune/i);
});
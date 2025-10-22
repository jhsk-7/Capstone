import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AppointmentDetailPage from '@/app/admin/appointments/[id]/page';
import axios from 'axios';

// Mock axios so we can control the GET response
jest.mock('axios');

// Mock the Next.js route param: /admin/appointments/[id]
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'abc123' }),
}));

// Mock normalizeError to surface a message
jest.mock('@/helpers/newErrorHandler', () => ({
  normalizeError: () => ({ status: 500, message: 'Failed to load appointment' }),
}));




test('renders appointment details after loading', async () => {
  // minimal appointment shape your component expects
  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        date: '2025-01-01T00:00:00.000Z',
        status: 'Pending',
        bikes: [],              // will trigger "No bike/services detail"
        createdAt: '2024-12-01T00:00:00.000Z',
        updatedAt: '2024-12-15T00:00:00.000Z',
      },
    },
  });

  render(<AppointmentDetailPage />);

  // Wait for a post-loading element that only appears after data loads
  expect(await screen.findByText(/No bike\/services detail/i)).toBeInTheDocument();

  // Heading is present
  expect(screen.getByRole('heading', { name: /appointment/i })).toBeInTheDocument();

  // Status pill text shows the current status
  expect(screen.getByText(/pending/i)).toBeInTheDocument();

  // Back link is present
  expect(screen.getByRole('link', { name: /back to all appointments/i })).toBeInTheDocument();

});


test('renders bike nickname and joined service names', async () => {
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

  // Matches: "Bike: Roadster - Services: Wash, Tune"
  const bikeLabel = await screen.findByText('Bike:', { selector: 'span' });
  const row = bikeLabel.closest('div'); // the wrapper div that contains the whole line
  expect(row).toHaveTextContent(/Bike:\s*Roadster\s*-\s*Services:\s*Wash,\s*Tune/i);
});



test('shows error message and back link when fetch fails', async () => {
  axios.get.mockRejectedValueOnce(new Error('network error'));

  render(<AppointmentDetailPage />);

  // Error message from normalizeError
  expect(
    await screen.findByText(/failed to load appointment/i)
  ).toBeInTheDocument();

  // Back link should be present in the error state (name = visible text)
  expect(
    screen.getByRole('link', { name: /back to all appointments/i })
  ).toBeInTheDocument();
});



test('clicking "Confirmed" updates status and disables its button', async () => {
  // Initial fetch returns a Pending appointment
  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        date: '2025-09-30T00:00:00.000Z',
        status: 'Pending',
        bikes: [],
        createdAt: '2025-09-01T00:00:00.000Z',
        updatedAt: '2025-09-10T00:00:00.000Z',
      },
    },
  });
  // Patch succeeds
  axios.patch.mockResolvedValueOnce({ data: { ok: true } });

  render(<AppointmentDetailPage />);

  // Wait for page to load
  expect(await screen.findByText(/pending/i)).toBeInTheDocument();

  const confirmBtn = screen.getByRole('button', { name: /confirmed/i });
  expect(confirmBtn).toBeEnabled();

  // Click Confirmed
  fireEvent.click(confirmBtn);

  // PATCH called with correct endpoint + payload
  await waitFor(() => {
    expect(axios.patch).toHaveBeenCalledWith(
      '/api/admin/appointments/abc123',
      { status: 'Confirmed' },
      { withCredentials: true }
    );
  });

  // --- Check 1: the "Confirmed" button becomes disabled
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /confirmed/i })).toBeDisabled()
  );

  // --- Check 2: the status pill (non-button element) shows "Confirmed"
  const confirmedNodes = screen.getAllByText(/confirmed/i);
  const statusPill = confirmedNodes.find((el) => el.tagName !== 'BUTTON');
  expect(statusPill).toBeTruthy();
});



test('clicking "Cancelled" updates status and disables its button', async () => {
  // Initial fetch returns a Pending appointment
  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        date: '2025-09-30T00:00:00.000Z',
        status: 'Pending',
        bikes: [],
        createdAt: '2025-09-01T00:00:00.000Z',
        updatedAt: '2025-09-10T00:00:00.000Z',
      },
    },
  });
  // Patch succeeds
  axios.patch.mockResolvedValueOnce({ data: { ok: true } });

  render(<AppointmentDetailPage />);

  // Wait for page to load
  expect(await screen.findByText(/pending/i)).toBeInTheDocument();

  const cancelBtn = screen.getByRole('button', { name: /cancelled/i });
  expect(cancelBtn).toBeEnabled();

  // Click Cancelled
  fireEvent.click(cancelBtn);

  // PATCH called with correct endpoint + payload
  await waitFor(() => {
    expect(axios.patch).toHaveBeenCalledWith(
      '/api/admin/appointments/abc123',
      { status: 'Cancelled' },
      { withCredentials: true }
    );
  });

  // --- Check 1: the "Cancelled" button becomes disabled
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /cancelled/i })).toBeDisabled()
  );

  // --- Check 2: the status pill (non-button element) shows "Cancelled"
  const cancelledNodes = screen.getAllByText(/cancelled/i);
  const statusPill = cancelledNodes.find((el) => el.tagName !== 'BUTTON');
  expect(statusPill).toBeTruthy();
});


test('Completed status disables only the Completed button on load', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        date: '2025-09-30T00:00:00.000Z',
        status: 'Completed',
        bikes: [],
        createdAt: '2025-09-01T00:00:00.000Z',
        updatedAt: '2025-09-10T00:00:00.000Z',
      },
    },
  });

  render(<AppointmentDetailPage />);

  // Wait for the Completed *button* (role-based avoids the pill)
  const completedBtn = await screen.findByRole('button', { name: /completed/i });
  expect(completedBtn).toBeDisabled();

  // Other action buttons should be enabled
  expect(screen.getByRole('button', { name: /confirmed/i })).toBeEnabled();
  expect(screen.getByRole('button', { name: /cancelled/i })).toBeEnabled();
});



const opts = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

describe('Appointment date rendering', () => {
  const originalTZ = process.env.TZ;

  beforeAll(() => {
    process.env.TZ = 'UTC'; // keep toLocaleString stable across machines
  });

  afterAll(() => {
    process.env.TZ = originalTZ;
  });

  test('shows the correctly formatted appointment date', async () => {
    // 2025-09-30 -> should render like "Tue, Sep 30, 2025"
    const iso = '2025-09-30T00:00:00.000Z';
    axios.get.mockResolvedValueOnce({
      data: {
        data: {
          date: iso,
          status: 'Pending',
          bikes: [],
          createdAt: '2025-09-01T00:00:00.000Z',
          updatedAt: '2025-09-10T00:00:00.000Z',
        },
      },
    });

    render(<AppointmentDetailPage />);

    const expectedDate = new Date(iso).toLocaleString(undefined, opts);
    expect(await screen.findByText(expectedDate)).toBeInTheDocument();
  });
});
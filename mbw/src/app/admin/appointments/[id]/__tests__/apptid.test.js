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

test('shows "Appointment not found." when API returns null appointment', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: null, // triggers the `if (!appt)` branch
    },
  });

  render(<AppointmentDetailPage />);

  expect(
    await screen.findByText(/appointment not found\./i)
  ).toBeInTheDocument();

  // Back link is still available in this branch
  expect(
    screen.getByRole('link', { name: /back to all appointments/i })
  ).toBeInTheDocument();
});

test('falls back to "Pending" when appointment has no status', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        date: '2025-09-30T00:00:00.000Z',
        // status intentionally omitted
        bikes: [],
        createdAt: null,
        updatedAt: null,
      },
    },
  });

  render(<AppointmentDetailPage />);

  // The pill should show "Pending" from `{appt.status || "Pending"}`
  const pill = await screen.findByText(/pending/i);
  expect(pill).toBeInTheDocument();
});

test('uses "—" nickname fallback and ignores non-array services', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        date: '2025-09-30T00:00:00.000Z',
        status: 'Pending',
        bikes: [
          {
            bikeId: { _id: 'b1' }, // no nickname -> nickname branch fallback
            services: 'not-an-array', // Array.isArray === false -> empty services string
          },
        ],
        createdAt: null,
        updatedAt: null,
      },
    },
  });

  render(<AppointmentDetailPage />);

  // row like: "Bike: — - Services:"
  const bikeLabel = await screen.findByText('Bike:', { selector: 'span' });
  const row = bikeLabel.closest('div');

  expect(row).toHaveTextContent(/Bike:\s*—\s*-\s*Services:/i);
  // make sure the raw non-array value was not rendered
  expect(row).not.toHaveTextContent(/not-an-array/i);
});

test('filters out services entries without a name and only shows named ones', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        date: '2025-09-30T00:00:00.000Z',
        status: 'Pending',
        bikes: [
          {
            bikeId: { _id: 'b1', nickname: 'Roadster' },
            services: [
              { name: 'Wash' },     // kept
              { _id: 's2' },        // no name -> mapped to null, then filtered
              'random-string',      // typeof !== "object" -> null -> filtered
            ],
          },
        ],
        createdAt: null,
        updatedAt: null,
      },
    },
  });

  render(<AppointmentDetailPage />);

  const bikeLabel = await screen.findByText('Bike:', { selector: 'span' });
  const row = bikeLabel.closest('div');

  // Only the named service should appear
  expect(row).toHaveTextContent(/Services:\s*Wash/i);
  expect(row).not.toHaveTextContent(/s2/i);
  expect(row).not.toHaveTextContent(/random-string/i);
});

test('falls back to raw string when updatedAt is not a valid date', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        date: '2025-09-30T00:00:00.000Z',
        status: 'Pending',
        bikes: [],
        createdAt: '2025-09-01T00:00:00.000Z',
        updatedAt: 'not-a-valid-date', // triggers Number.isNaN branch in formatDate
      },
    },
  });

  render(<AppointmentDetailPage />);

  // We don't care about the exact Created date formatting here,
  // just that it's rendered at all.
  expect(await screen.findByText(/created:/i)).toBeInTheDocument();

  // Updated date should show the raw string
  expect(
    screen.getByText(/updated:\s*not-a-valid-date/i)
  ).toBeInTheDocument();
});

test('shows error message if status update PATCH fails', async () => {
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

  // This exercises the catch block inside handleStatusUpdate
  axios.patch.mockRejectedValueOnce(new Error('update failed'));

  render(<AppointmentDetailPage />);

  // 1) Wait for the normal detail view to load
  expect(await screen.findByText(/pending/i)).toBeInTheDocument();

  // 2) Click the "Completed" button
  const completedBtn = screen.getByRole('button', { name: /completed/i });
  expect(completedBtn).toBeEnabled();

  fireEvent.click(completedBtn);

  // 3) PATCH should have been called with the correct args
  await waitFor(() => {
    expect(axios.patch).toHaveBeenCalledWith(
      '/api/admin/appointments/abc123',
      { status: 'Completed' },
      { withCredentials: true }
    );
  });

  // 4) Component switches into the error view using normalizeError message
  expect(
    await screen.findByText(/failed to load appointment/i)
  ).toBeInTheDocument();

  // Optional: verify we’re in the error UI and buttons are gone
  expect(
    screen.queryByRole('button', { name: /completed/i })
  ).toBeNull();
  expect(
    screen.queryByRole('button', { name: /confirmed/i })
  ).toBeNull();
  expect(
    screen.queryByRole('button', { name: /cancelled/i })
  ).toBeNull();
});

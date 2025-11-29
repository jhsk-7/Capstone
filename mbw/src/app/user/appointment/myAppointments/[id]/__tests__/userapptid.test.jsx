// src/app/user/appointment/myAppointments/[id]/__tests__/userapptid.test.jsx
import { render, screen } from '@testing-library/react';
import axios from 'axios';
import AppointmentDetailPage from '@/app/user/appointment/myAppointments/[id]/page';

jest.mock('axios');

// ----- Mocks we can control per-test -----
const setNavContextMock = jest.fn();
const useParamsMock = jest.fn();
const useAppContextMock = jest.fn();

// mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: () => useParamsMock(),
}));

// mock appContext, but delegate to our mock fn
jest.mock('@/app/appContext', () => ({
  useAppContext: () => useAppContextMock(),
}));

// mock normalizeError so we can drive error branch
const normalizeErrorMock = jest.fn();
jest.mock('@/helpers/newErrorHandler', () => ({
  normalizeError: (...args) => normalizeErrorMock(...args),
}));

beforeEach(() => {
  jest.clearAllMocks();

  // default params + context
  useParamsMock.mockReturnValue({ id: 'a1' });
  useAppContextMock.mockReturnValue({
    setNavContext: setNavContextMock,
    isDarkMode: false,
  });
});

// --- BASE HAPPY PATH: bikes = [] (Array.isArray true, length 0) ---
test('renders appointment detail after loading and shows "No bike/services detail" for empty bikes array', async () => {
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

  render(<AppointmentDetailPage />);

  // Wait for loaded content
  expect(await screen.findByText(/no bike\/services detail/i)).toBeInTheDocument();

  // Heading appears
  expect(screen.getByRole('heading', { name: /appointment/i })).toBeInTheDocument();

  // Back link (aria-label)
  expect(
    screen.getByRole('link', { name: /go to my appointments/i })
  ).toBeInTheDocument();

  // Status pill text
  expect(screen.getByText(/pending/i)).toBeInTheDocument();
});

// --- bikes array with nickname + object services (original test) ---
test('shows bike nickname and joined service names', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        date: '2025-09-30T00:00:00.000Z',
        status: 'Pending',
        bikes: [
          {
            bikeId: { _id: 'b1', nickname: 'Roadster' },
            services: [
              { _id: 's1', name: 'Wash' },
              { _id: 's2', name: 'Tune' },
            ],
          },
        ],
        createdAt: '2025-09-01T00:00:00.000Z',
        updatedAt: '2025-09-10T00:00:00.000Z',
      },
    },
  });

  render(<AppointmentDetailPage />);

  const bikeLabel = await screen.findByText('Bike:', { selector: 'span' });
  const row = bikeLabel.closest('div');
  expect(row).toHaveTextContent(/Bike:\s*Roadster\s*-\s*Services:\s*Wash,\s*Tune/i);
});

// --- setNavContext branch ---
test('calls setNavContext with "userIn" on mount', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        date: '2025-09-30T00:00:00.000Z',
        status: 'Pending',
        bikes: [],
      },
    },
  });

  render(<AppointmentDetailPage />);

  await screen.findByText(/no bike\/services detail/i);

  expect(setNavContextMock).toHaveBeenCalledWith('userIn');
});

// --- error branch (normalizeError + error UI) ---
test('shows error message when fetching appointment fails', async () => {
  const err = new Error('Network error');
  axios.get.mockRejectedValueOnce(err);
  normalizeErrorMock.mockReturnValueOnce({ message: 'Something went wrong' });

  render(<AppointmentDetailPage />);

  expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  expect(normalizeErrorMock).toHaveBeenCalledWith(err);
});

// --- !appt branch: API returns null data ---
test('shows "Appointment not found." when API returns null data', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: null,
    },
  });

  render(<AppointmentDetailPage />);

  expect(await screen.findByText(/appointment not found/i)).toBeInTheDocument();
});

// --- !id branch: no params => no fetch, loading skeleton stays ---
test('does not fetch when id is missing and shows loading skeleton', () => {
  useParamsMock.mockReturnValue({}); // no id
  render(<AppointmentDetailPage />);

  expect(axios.get).not.toHaveBeenCalled();

  // skeleton heading
  expect(screen.getByRole('heading', { name: /appointment/i })).toBeInTheDocument();
});

// --- bikes non-array (null) -> "No bike/services detail" via else branch ---
test('handles non-array bikes value as "No bike/services detail"', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        date: '2025-09-30T00:00:00.000Z',
        status: 'Pending',
        bikes: null, // Array.isArray === false
      },
    },
  });

  render(<AppointmentDetailPage />);

  expect(await screen.findByText(/no bike\/services detail/i)).toBeInTheDocument();
});

// --- services: strings + objects + nickname fallback ("—") ---
test('falls back to "—" nickname and only shows object service names', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        date: '2025-09-30T00:00:00.000Z',
        status: 'Pending',
        bikes: [
          {
            bikeId: { _id: 'b1' }, // no nickname => "—"
            services: ['Wash', { _id: 's2', name: 'Detail' }],
          },
        ],
      },
    },
  });

  render(<AppointmentDetailPage />);

  const bikeLabel = await screen.findByText('Bike:', { selector: 'span' });
  const row = bikeLabel.closest('div');

  // nickname fallback
  expect(row).toHaveTextContent(/Bike:\s*—/);

  // services: only object name kept ("Detail"), string "Wash" dropped by map/filter
  expect(row).toHaveTextContent(/Services:\s*Detail/);
  expect(row).not.toHaveTextContent(/Wash/);
});

// --- services is NOT an array (services branch else: "") ---
test('uses "—" when services is not an array', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        date: '2025-09-30T00:00:00.000Z',
        status: 'Pending',
        bikes: [
          {
            bikeId: { _id: 'b1', nickname: 'Hybrid' },
            services: null, // Array.isArray(false) -> serviceNames ""
          },
        ],
      },
    },
  });

  render(<AppointmentDetailPage />);

  const bikeLabel = await screen.findByText('Bike:', { selector: 'span' });
  const row = bikeLabel.closest('div');

  expect(row).toHaveTextContent(/Bike:\s*Hybrid/);
  expect(row).toHaveTextContent(/Services:\s*—/);
});

// --- bikeId as string (nickname "—", key uses string branch) ---
test('handles bikeId as string and shows fallback nickname', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        date: '2025-09-30T00:00:00.000Z',
        status: 'Pending',
        bikes: [
          {
            bikeId: 'bike-123', // typeof "string" branch in key and nickname
            services: [],
          },
        ],
      },
    },
  });

  render(<AppointmentDetailPage />);

  const bikeLabel = await screen.findByText('Bike:', { selector: 'span' });
  const row = bikeLabel.closest('div');

  // nickname: not object -> "—"
  expect(row).toHaveTextContent(/Bike:\s*—/);
  expect(row).toHaveTextContent(/Services:\s*—/);
});

// --- bikeId object with "id" but no "_id" (key uses .id branch) ---
test('handles bikeId object with id but no _id', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        date: '2025-09-30T00:00:00.000Z',
        status: 'Pending',
        bikes: [
          {
            bikeId: { id: 'b123', nickname: 'Grinder' },
            services: [{ _id: 's1', name: 'Clean' }],
          },
        ],
      },
    },
  });

  render(<AppointmentDetailPage />);

  const bikeLabel = await screen.findByText('Bike:', { selector: 'span' });
  const row = bikeLabel.closest('div');

  expect(row).toHaveTextContent(/Bike:\s*Grinder/);
  expect(row).toHaveTextContent(/Services:\s*Clean/);
});

// --- bikeId missing/null so key falls back to idx ---
test('handles missing bikeId and falls back to idx key', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        date: '2025-09-30T00:00:00.000Z',
        status: 'Pending',
        bikes: [
          {
            bikeId: null, // no object, no string => key uses idx
            services: [],
          },
        ],
      },
    },
  });

  render(<AppointmentDetailPage />);

  const bikeLabel = await screen.findByText('Bike:', { selector: 'span' });
  const row = bikeLabel.closest('div');

  expect(row).toHaveTextContent(/Bike:\s*—/);
  expect(row).toHaveTextContent(/Services:\s*—/);
});

// --- invalid date triggers formatDate NaN branch (returns raw input) ---
test('shows raw date string when date is invalid', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        date: 'not-a-real-date',
        status: 'Pending',
        bikes: [],
      },
    },
  });

  render(<AppointmentDetailPage />);

  expect(await screen.findByText('not-a-real-date')).toBeInTheDocument();
});

// --- DARK MODE branch (isDarkMode: true) ---
test('renders correctly in dark mode (no bg-white class applied)', async () => {
  // override default context for this test
  useAppContextMock.mockReturnValue({
    setNavContext: setNavContextMock,
    isDarkMode: true,
  });

  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        date: '2025-09-30T00:00:00.000Z',
        status: 'Pending',
        bikes: [],
      },
    },
  });

  render(<AppointmentDetailPage />);

  await screen.findByText(/no bike\/services detail/i);

  // in dark mode, top-level wrapper should NOT have bg-white
  const wrappersWithBgWhite = document.querySelectorAll('.bg-white');
  expect(wrappersWithBgWhite.length).toBe(0);
});

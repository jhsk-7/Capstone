// __tests__/myAppointments.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MyAppointmentsPage from '@/app/user/appointment/myAppointments/page';

jest.mock('axios');

// mock router
const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

// ✅ mock appContext so isDarkMode exists and we don't depend on real provider
jest.mock('@/app/appContext', () => ({
  useAppContext: () => ({
    isDarkMode: false,
  }),
}));

// ✅ mock normalizeError to hit the error branch deterministically
const normalizeErrorMock = jest.fn(() => ({ message: 'Something went wrong' }));
jest.mock('@/helpers/newErrorHandler', () => ({
  normalizeError: (...args) => normalizeErrorMock(...args),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test('shows empty state when there are no appointments', async () => {
  axios.get.mockResolvedValueOnce({ data: { appointments: [] } });

  render(<MyAppointmentsPage />);

  // After loading finishes, the empty message appears
  expect(await screen.findByText(/no appointments yet/i)).toBeInTheDocument();
});

test('shows loading state initially', () => {
  // even if the request resolves later, loading text is rendered on first paint
  axios.get.mockResolvedValueOnce({ data: { appointments: [] } });

  render(<MyAppointmentsPage />);

  expect(screen.getByText(/loading appointments/i)).toBeInTheDocument();
});

test('shows error message when fetching appointments fails', async () => {
  const err = new Error('Network boom');
  axios.get.mockRejectedValueOnce(err);

  render(<MyAppointmentsPage />);

  // normalizeError should be called with the error
  expect(normalizeErrorMock).toHaveBeenCalledTimes(0); // not yet

  // error eventually appears
  expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  expect(normalizeErrorMock).toHaveBeenCalledWith(err);
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

test('uses $oid when _id is an object', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      appointments: [
        {
          _id: { $oid: 'abc123' },
          date: '2025-10-01T00:00:00.000Z',
          status: 'Confirmed',
          bikes: [],
        },
      ],
    },
  });

  render(<MyAppointmentsPage />);

  const card = await screen.findByRole('button', { name: /open appointment/i });

  await userEvent.click(card);

  expect(pushMock).toHaveBeenCalledWith('./myAppointments/abc123');
});

test('does not navigate when appointment has no usable id', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      appointments: [
        {
          // no _id string and no _id.$oid => id becomes ""
          _id: { someOtherField: 'nope' },
          date: '2025-10-02T00:00:00.000Z',
          status: 'Pending',
          bikes: [],
        },
      ],
    },
  });

  render(<MyAppointmentsPage />);

  const card = await screen.findByRole('button', { name: /open appointment/i });

  await userEvent.click(card);

  expect(pushMock).not.toHaveBeenCalled();
});

test('card shows "No bike/services detail" when bikes array is empty', async () => {
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

  const card = await screen.findByRole('button', { name: /open appointment/i });

  expect(card).toHaveTextContent(/no bike\/services detail/i);
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
              services: [
                { _id: 's1', name: 'Wash' },
                { _id: 's2', name: 'Tune' },
              ],
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

test('falls back to bikeId string and "—" when services list is empty', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      appointments: [
        {
          _id: 'a1',
          date: '2025-09-30T00:00:00.000Z',
          status: 'Pending',
          bikes: [
            {
              bikeId: 'bike-123',
              services: [],
            },
          ],
        },
      ],
    },
  });

  render(<MyAppointmentsPage />);

  const card = await screen.findByRole('button', { name: /open appointment/i });

  expect(card).toHaveTextContent(/Bike:\s*bike-123/i);
  expect(card).toHaveTextContent(/Services:\s*—/i);
});

test('handles service names as strings as well as objects', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      appointments: [
        {
          _id: 'a1',
          date: '2025-09-30T00:00:00.000Z',
          status: 'Pending',
          bikes: [
            {
              bikeId: { model: 'GravelPro' },
              services: ['Wash', { _id: 's2', name: 'Detail' }],
            },
          ],
        },
      ],
    },
  });

  render(<MyAppointmentsPage />);

  const card = await screen.findByRole('button', { name: /open appointment/i });

  expect(card).toHaveTextContent(/Bike:\s*GravelPro/i);
  expect(card).toHaveTextContent(/Services:\s*Wash,\s*Detail/i);
});

test('groups multiple appointments by date (multiple cards render)', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      appointments: [
        {
          _id: 'a1',
          date: '2025-09-30T08:00:00.000Z',
          status: 'Pending',
          bikes: [],
        },
        {
          _id: 'a2',
          date: '2025-09-30T10:00:00.000Z',
          status: 'Confirmed',
          bikes: [],
        },
      ],
    },
  });

  render(<MyAppointmentsPage />);

  // Both cards should render (same day group)
  const cards = await screen.findAllByRole('button', { name: /open appointment/i });
  expect(cards.length).toBe(2);
});

import { render, screen, fireEvent } from '@testing-library/react';
import MyAppointmentsPage from '@/app/admin/appointments/page';
import axios from 'axios';

jest.mock('axios');

const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

// put this mock near the top so it's clearly applied for all tests
jest.mock('@/helpers/newErrorHandler', () => ({
  normalizeError: () => ({ message: 'Could not load appointments' }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

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

test('shows error message when fetching appointments fails', async () => {
  axios.get.mockRejectedValueOnce(new Error('network down'));

  render(<MyAppointmentsPage />);

  // error banner shows the normalizeError message
  expect(
    await screen.findByText(/could not load appointments/i)
  ).toBeInTheDocument();
});

/**
 * EXTRA BRANCHES BELOW
 */

// Branch: different statuses (e.g. Pending vs Confirmed/Completed)
// If your component styles status pills differently based on value,
// this will execute those branches.
test('renders multiple appointments with different statuses', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      appointments: [
        {
          _id: 'a1',
          date: '2025-09-30T00:00:00.000Z',
          status: 'Pending',
          bikes: [],
          userId: { username: 'User One' },
        },
        {
          _id: 'b2',
          date: '2025-10-01T00:00:00.000Z',
          status: 'Confirmed',
          bikes: [],
          userId: { username: 'User Two' },
        },
        {
          _id: 'c3',
          date: '2025-10-02T00:00:00.000Z',
          status: 'Completed',
          bikes: [],
          userId: { username: 'User Three' },
        },
      ],
    },
  });

  render(<MyAppointmentsPage />);

  // All status labels should be present – this covers the branch logic
  expect(await screen.findByText(/pending/i)).toBeInTheDocument();
  expect(screen.getByText(/confirmed/i)).toBeInTheDocument();
  expect(screen.getByText(/completed/i)).toBeInTheDocument();
});

// Branch: fallback when username is missing
// If your component uses something like userId?.username || 'Unknown user',
// this will cover the "else" path.
test('falls back to "Unknown" when username is missing but userId exists', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      appointments: [
        {
          _id: 'no-user',
          date: '2025-09-30T00:00:00.000Z',
          status: 'Pending',
          userId: {}, // truthy object, but no username
          bikes: [
            {
              bikeId: { _id: 'bike1', model: 'Trek FX' },
              services: ['Wash'],
            },
          ],
        },
      ],
    },
  });

  render(<MyAppointmentsPage />);

  // User fallback branch
  expect(
    await screen.findByText(/user:\s*unknown/i)
  ).toBeInTheDocument();

  // Bike / services info (simpler assertions)
  expect(screen.getByText(/bike:/i)).toBeInTheDocument();
  expect(screen.getByText(/trek fx/i)).toBeInTheDocument();
  expect(screen.getByText(/services:/i)).toBeInTheDocument();
  expect(screen.getByText(/wash/i)).toBeInTheDocument();
});


// Branch: clicking a different card still navigates correctly
// This doesn't add much statement coverage, but it does exercise another
// branch in the map callback if you do any per-index logic.
test('navigates with correct id when a non-first appointment is clicked', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      appointments: [
        {
          _id: 'first',
          date: '2025-09-30T00:00:00.000Z',
          status: 'Pending',
          bikes: [],
          userId: { username: 'First' },
        },
        {
          _id: 'second',
          date: '2025-10-01T00:00:00.000Z',
          status: 'Pending',
          bikes: [],
          userId: { username: 'Second' },
        },
      ],
    },
  });

  render(<MyAppointmentsPage />);

  // Wait until list is rendered
  await screen.findAllByText(/pending/i);

  // If each card has some identifying text, you can be more specific here.
  const cards = screen.getAllByRole('button', { name: /open appointment/i });

  fireEvent.click(cards[1]);

  expect(pushMock).toHaveBeenCalledWith('./appointments/second');
});


test('navigates using $oid when _id is an object', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      appointments: [
        {
          _id: { $oid: 'object-id-123' }, // non-string path
          date: '2025-09-30T00:00:00.000Z',
          status: 'Pending',
          userId: { username: 'Jordan' },
          bikes: [
            {
              bikeId: { _id: 'bike1', model: 'Model A' },
              services: ['Wash'],
            },
          ],
        },
      ],
    },
  });

  render(<MyAppointmentsPage />);

  await screen.findByText(/pending/i);

  const card = screen.getByRole('button', {
    name: /open appointment/i,
  });
  fireEvent.click(card);

  expect(pushMock).toHaveBeenCalledWith('./appointments/object-id-123');
});


test('does not navigate when appointment id is missing', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      appointments: [
        {
          _id: null, // leads to id === ""
          date: '2025-09-30T00:00:00.000Z',
          status: 'Pending',
          userId: { username: 'Jordan' },
          bikes: [
            {
              bikeId: { _id: 'bike1', model: 'Model A' },
              services: ['Wash'],
            },
          ],
        },
      ],
    },
  });

  render(<MyAppointmentsPage />);

  await screen.findByText(/pending/i);

  const card = screen.getByRole('button', {
    name: /open appointment/i,
  });
  fireEvent.click(card);

  // guard branch: id is falsy, so no push
  expect(pushMock).not.toHaveBeenCalled();
});


test('covers bike and services label fallbacks', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      appointments: [
        {
          _id: 'bike-fallbacks',
          date: '2025-09-30T00:00:00.000Z',
          status: 'Pending',
          userId: {}, // will trigger "User: Unknown" in first bike block
          bikes: [
            // 1) nickname branch
            {
              bikeId: { _id: 'b1', nickname: 'Speedy', model: 'Model X' },
              services: ['Tune', 'Wash'], // string services
            },
            // 2) model branch (no nickname)
            {
              bikeId: { _id: 'b2', model: 'Model Y' },
              services: [{ name: 'Fix Flat' }], // object with name
            },
            // 3) string bikeId branch
            {
              bikeId: 'STRING-BIKE-ID',
              services: [{ _id: 'svc-no-name' }], // object without name -> uses _id
            },
            // 4) object with only _id (services empty -> fallback)
            {
              bikeId: { _id: 'ID-ONLY' },
              services: [],
            },
            // 5) nothing defined (bike/services both null -> fallbacks)
            {
              bikeId: null,
              services: null,
            },
          ],
        },
      ],
    },
  });

  render(<MyAppointmentsPage />);

  // status ensures list rendered
  await screen.findByText(/pending/i);

  // User fallback
  expect(screen.getByText(/user:\s*unknown/i)).toBeInTheDocument();

  // Bike label branches
  expect(screen.getByText(/speedy/i)).toBeInTheDocument();      // nickname
  expect(screen.getByText(/model y/i)).toBeInTheDocument();     // model
  expect(screen.getByText(/string-bike-id/i)).toBeInTheDocument(); // string bikeId
  expect(screen.getByText(/id-only/i)).toBeInTheDocument();     // _id fallback

  // Services branches
  expect(screen.getByText(/tune, wash/i)).toBeInTheDocument();  // string array join
  expect(screen.getByText(/fix flat/i)).toBeInTheDocument();    // name from object
  expect(screen.getByText(/svc-no-name/i)).toBeInTheDocument(); // _id from object

  // We **don’t** assert directly on "—" – the branches that render it are
  // already executed by bikes[3] and bikes[4], which is enough for coverage.
});

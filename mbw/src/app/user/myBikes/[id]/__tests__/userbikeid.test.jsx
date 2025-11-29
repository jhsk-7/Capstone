// src/app/user/myBikes/[id]/__tests__/userbikeid.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import BikeDetailPage from '@/app/user/myBikes/[id]/page';

jest.mock('axios');

// controllable mocks
const useParamsMock = jest.fn();
const pushMock = jest.fn();
const setNavContextMock = jest.fn();
let isDarkModeMock = false;

// mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: () => useParamsMock(),
  useRouter: () => ({ push: pushMock }),
}));

// mock appContext
jest.mock('@/app/appContext', () => ({
  useAppContext: () => ({
    setNavContext: setNavContextMock,
    isDarkMode: isDarkModeMock,
  }),
}));

// mock normalizeError for error branch
const normalizeErrorMock = jest.fn(() => ({ message: 'Something went wrong' }));
jest.mock('@/helpers/newErrorHandler', () => ({
  normalizeError: (...args) => normalizeErrorMock(...args),
}));

beforeEach(() => {
  jest.clearAllMocks();
  isDarkModeMock = false;
  useParamsMock.mockReturnValue({ id: 'b1' }); // default id
});

//
// 🟦 loading branch
//
test('shows loading state while fetching bike', () => {
  // keep promise pending so loading stays true
  axios.get.mockImplementation(() => new Promise(() => {}));

  render(<BikeDetailPage />);

  expect(screen.getByText(/loading bike…/i)).toBeInTheDocument();
  expect(axios.get).toHaveBeenCalledWith(
    '/api/users/bikes/myBikes/b1',
    expect.objectContaining({ withCredentials: true })
  );
});

//
// 🟦 no id -> no fetch, still loading
//
test('does not fetch when id is missing and stays in loading state', () => {
  useParamsMock.mockReturnValue({}); // no id
  render(<BikeDetailPage />);

  expect(axios.get).not.toHaveBeenCalled();
  expect(screen.getByText(/loading bike…/i)).toBeInTheDocument();
});

//
// 🟦 error branch (normalizeError + error UI)
//
test('shows error message when fetch fails', async () => {
  const err = new Error('network');
  axios.get.mockRejectedValueOnce(err);

  render(<BikeDetailPage />);

  expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  expect(normalizeErrorMock).toHaveBeenCalledWith(err);

  // back link visible
  expect(
    screen.getByRole('link', { name: /back to my bikes/i })
  ).toBeInTheDocument();
});

//
// 🟦 !bike => "Bike not found."
//
test('shows "Bike not found." when API returns null bike', async () => {
  axios.get.mockResolvedValueOnce({ data: { data: null } });

  render(<BikeDetailPage />);

  expect(await screen.findByText(/bike not found/i)).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /back to my bikes/i })
  ).toBeInTheDocument();
});

//
// 🟦 success detail view with picture + color
//
test('renders bike details with picture, make/model, and color', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        nickname: 'Roadster',
        make: 'Trek',
        model: 'FX',
        color: 'Blue',
        picture: 'https://example.com/bike.jpg',
      },
    },
  });

  render(<BikeDetailPage />);

  expect(
    await screen.findByRole('heading', { name: /roadster/i })
  ).toBeInTheDocument();
  expect(screen.getByText(/trek\s+fx/i)).toBeInTheDocument();
  expect(screen.getByText(/color:\s*blue/i)).toBeInTheDocument();

  const img = screen.getByRole('img', { name: /roadster/i });
  expect(img).toHaveAttribute('src', 'https://example.com/bike.jpg');
});

//
// 🟦 success detail view without picture or color
//
test('renders details without picture and hides color when not provided', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        nickname: 'Commuter',
        make: 'Giant',
        model: 'Escape',
        // no color, no picture
      },
    },
  });

  render(<BikeDetailPage />);

  expect(
    await screen.findByRole('heading', { name: /commuter/i })
  ).toBeInTheDocument();
  expect(screen.getByText(/giant\s+escape/i)).toBeInTheDocument();
  expect(screen.queryByText(/color:/i)).toBeNull();
  expect(screen.queryByRole('img')).toBeNull();
});

//
// 🟦 setNavContext('userIn')
//
test('calls setNavContext with "userIn" on mount', async () => {
  axios.get.mockResolvedValueOnce({
    data: { data: { nickname: 'Roadster', make: 'Trek', model: 'FX' } },
  });

  render(<BikeDetailPage />);

  await screen.findByRole('heading', { name: /roadster/i });
  expect(setNavContextMock).toHaveBeenCalledWith('userIn');
});

//
// 🟦 delete modal show/hide + nickname fallback
//
test('opens and closes delete confirmation modal and uses nickname fallbacks', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        nickname: '', // to trigger header "My Bike" and modal "this bike"
        make: 'Brand',
        model: 'Model',
      },
    },
  });

  render(<BikeDetailPage />);

  // header "My Bike" (fallback)
  expect(
    await screen.findByRole('heading', { name: /my bike/i })
  ).toBeInTheDocument();

  // open modal via header Delete button (only one at this point)
  await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));

  // modal title visible
  const modalTitle = await screen.findByText(/delete bike\?/i);
  expect(modalTitle).toBeInTheDocument();

  // there should be at least one "this bike" somewhere (inline + modal)
  const thisBikeMatches = screen.getAllByText(/this bike/i);
  expect(thisBikeMatches.length).toBeGreaterThan(0);

  // close with Cancel (specifically modal Cancel)
  const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
  const modalCancel = cancelButtons[cancelButtons.length - 1];
  await userEvent.click(modalCancel);

  await waitFor(() => {
    expect(screen.queryByText(/delete bike\?/i)).toBeNull();
  });
});

//
// 🟦 delete success branch
//
test('successful delete navigates back with deleted=1 and shows deleting state', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        nickname: 'Roadster',
        make: 'Trek',
        model: 'FX',
      },
    },
  });
  axios.delete.mockResolvedValueOnce({ data: { ok: true } });

  render(<BikeDetailPage />);

  // open modal via header delete
  await userEvent.click(
    await screen.findByRole('button', { name: /^delete$/i })
  );

  // now two Delete buttons exist; pick the modal one (last)
  const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i });
  const modalDelete = deleteButtons[deleteButtons.length - 1];

  // click delete in modal
  await userEvent.click(modalDelete);

  // button goes to "Deleting…"
  expect(
    screen.getByRole('button', { name: /deleting…/i })
  ).toBeDisabled();

  await waitFor(() => {
    expect(pushMock).toHaveBeenCalledWith('/user/myBikes?deleted=1');
  });
});

//
// 🟦 delete error with response.data.error
//
test('shows actionError when delete fails with server error message', async () => {
  axios.get.mockResolvedValueOnce({
    data: { data: { nickname: 'Roadster', make: 'Trek', model: 'FX' } },
  });

  axios.delete.mockRejectedValueOnce({
    response: { data: { error: 'Cannot delete: has appointments' } },
  });

  render(<BikeDetailPage />);

  // open modal
  await userEvent.click(
    await screen.findByRole('button', { name: /^delete$/i })
  );

  // click modal delete (last Delete button)
  const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i });
  const modalDelete = deleteButtons[deleteButtons.length - 1];
  await userEvent.click(modalDelete);

  expect(
    await screen.findByText(/cannot delete: has appointments/i)
  ).toBeInTheDocument();

  // deleting flag reset -> modal delete button back to enabled "Delete"
  const deleteButtonsAfter = screen.getAllByRole('button', { name: /^delete$/i });
  const modalDeleteAfter = deleteButtonsAfter[deleteButtonsAfter.length - 1];
  expect(modalDeleteAfter).toBeEnabled();
});

//
// 🟦 delete error with only err.message
//
test('shows actionError from err.message when no server error is provided', async () => {
  axios.get.mockResolvedValueOnce({
    data: { data: { nickname: 'Roadster', make: 'Trek', model: 'FX' } },
  });

  const err = new Error('Boom');
  axios.delete.mockRejectedValueOnce(err);

  render(<BikeDetailPage />);

  // open modal
  await userEvent.click(
    await screen.findByRole('button', { name: /^delete$/i })
  );

  // click modal delete (last Delete button)
  const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i });
  const modalDelete = deleteButtons[deleteButtons.length - 1];
  await userEvent.click(modalDelete);

  expect(await screen.findByText(/boom/i)).toBeInTheDocument();
});

//
// 🟦 dark mode branch
//
test('renders correctly in dark mode (no bg-white or text-gray-900 on root)', async () => {
  isDarkModeMock = true;

  axios.get.mockResolvedValueOnce({
    data: {
      data: {
        nickname: 'Roadster',
        make: 'Trek',
        model: 'FX',
      },
    },
  });

  render(<BikeDetailPage />);

  await screen.findByRole('heading', { name: /roadster/i });

  // top-level bg-white should not exist in dark mode
  const bgWhites = document.querySelectorAll('.bg-white');
  expect(bgWhites.length).toBe(0);

  const paragraph = screen.getByText(/trek\s+fx/i);
  expect(paragraph.className).not.toMatch(/text-gray-900/);
});

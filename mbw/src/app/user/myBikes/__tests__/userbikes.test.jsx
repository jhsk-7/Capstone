// src/app/user/myBikes/__tests__/userbikes.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import BikesPage from '@/app/user/myBikes/page';

jest.mock('axios');

const pushMock = jest.fn();
const setNavContextMock = jest.fn();
let isDarkModeMock = false;

// mock router
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

// mock app context
jest.mock('@/app/appContext', () => ({
  useAppContext: () => ({
    setNavContext: setNavContextMock,
    isDarkMode: isDarkModeMock,
  }),
}));

// mock normalizeError for error branch
const normalizeErrorMock = jest.fn(() => ({
  status: 500,
  message: 'Something went wrong',
}));
jest.mock('@/helpers/newErrorHandler', () => ({
  normalizeError: (...args) => normalizeErrorMock(...args),
}));

beforeEach(() => {
  jest.clearAllMocks();
  isDarkModeMock = false;
});

//
// 🟦 Loading state
//
test('shows loading skeleton initially', () => {
  axios.get.mockImplementation(() => new Promise(() => {})); // never resolves

  render(<BikesPage />);

  expect(screen.getByRole('heading', { name: /my bikes/i })).toBeInTheDocument();
  expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
});

//
// 🟦 Empty state
//
test('shows empty state when no bikes are returned', async () => {
  axios.get.mockResolvedValueOnce({ data: { data: [] } });

  render(<BikesPage />);

  expect(await screen.findByText(/no bikes found/i)).toBeInTheDocument();
  expect(
    screen.getByText(/add your first bike to start booking services/i)
  ).toBeInTheDocument();
});

//
// 🟦 List rendering – placeholder branch
//
test('renders a bike card with nickname, make/model, and color', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: [
        {
          _id: 'b1',
          nickname: 'Roadster',
          make: 'Trek',
          model: 'FX',
          color: 'Blue',
        },
      ],
    },
  });

  render(<BikesPage />);

  expect(await screen.findByText(/roadster/i)).toBeInTheDocument();
  expect(screen.getByText(/trek\s+fx/i)).toBeInTheDocument();
  expect(screen.getByText(/color:\s*blue/i)).toBeInTheDocument();

  // placeholder SVG exists
  expect(
    document.querySelector('div.w-24.h-24.rounded.bg-gray-100')
  ).not.toBeNull();
});

//
// 🟦 List rendering – picture branch
//
test('renders an image when picture is provided', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: [
        {
          _id: 'b1',
          nickname: 'Roadster',
          model: 'FX',
          color: 'Blue',
          picture: 'https://example.com/bike.jpg',
        },
      ],
    },
  });

  render(<BikesPage />);

  const img = await screen.findByRole('img', { name: /roadster/i });
  expect(img).toHaveAttribute('src', 'https://example.com/bike.jpg');
});

//
// 🟦 Navigation
//
test('navigates to bike detail when a bike card is clicked (string _id)', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: [
        {
          _id: 'b1',
          nickname: 'Roadster',
        },
      ],
    },
  });

  render(<BikesPage />);

  const nickname = await screen.findByText(/roadster/i);
  await userEvent.click(nickname);

  expect(pushMock).toHaveBeenCalledWith('/user/myBikes/b1');
});

//
// 🟦 _id: {$oid} branch
//
test('uses $oid when _id is an object', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: [
        { _id: { $oid: 'abc123' }, nickname: 'Gravel' },
      ],
    },
  });

  render(<BikesPage />);

  const nickname = await screen.findByText(/gravel/i);
  await userEvent.click(nickname);

  expect(pushMock).toHaveBeenCalledWith('/user/myBikes/abc123');
});

//
// 🟦 _id: object without $oid → empty "" id
//
test('falls back to empty id when _id has no $oid', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: [
        { _id: { someOther: 'val' }, nickname: 'Mystery' },
      ],
    },
  });

  render(<BikesPage />);

  const nickname = await screen.findByText(/mystery/i);
  await userEvent.click(nickname);

  expect(pushMock).toHaveBeenCalledWith('/user/myBikes/');
});

//
// 🟦 brand/make/model branch + missing color
//
test('brand-only bike still renders make/model line and hides color when missing', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      data: [
        {
          _id: 'b2',
          nickname: '',
          brand: 'Specialized',
          model: 'Sirrus',
        },
      ],
    },
  });

  render(<BikesPage />);

  // nickname fallback to "My Bike"
  expect(await screen.findByText(/my bike/i)).toBeInTheDocument();

  // FIXED: custom matcher to handle whitespace/splitting
  const brandModel = await screen.findByText((content) =>
    /specialized/i.test(content) && /sirrus/i.test(content)
  );
  expect(brandModel).toBeInTheDocument();

  expect(screen.queryByText(/color:/i)).toBeNull();
});

//
// 🟦 Error state
//
test('shows error state when fetch fails', async () => {
  const err = new Error('network fail');
  axios.get.mockRejectedValueOnce(err);

  render(<BikesPage />);

  expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  expect(normalizeErrorMock).toHaveBeenCalledWith(err);

  expect(screen.getByRole('heading', { name: /my bikes/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /add bike/i })).toBeInTheDocument();
});

//
// 🟦 setNavContext('userIn')
//
test('calls setNavContext("userIn") after successful fetch', async () => {
  axios.get.mockResolvedValueOnce({ data: { data: [] } });

  render(<BikesPage />);

  await screen.findByText(/no bikes found/i);

  expect(setNavContextMock).toHaveBeenCalledWith('userIn');
});

//
// 🟦 Dark mode branch
//
test('renders correctly in dark mode (no bg-white or text-gray-900)', async () => {
  isDarkModeMock = true;

  axios.get.mockResolvedValueOnce({ data: { data: [] } });

  render(<BikesPage />);

  await screen.findByText(/no bikes found/i);

  expect(document.querySelectorAll('.bg-white').length).toBe(0);

  const title = screen.getByRole('heading', { name: /my bikes/i });
  expect(title.className).not.toMatch(/text-gray-900/);
});

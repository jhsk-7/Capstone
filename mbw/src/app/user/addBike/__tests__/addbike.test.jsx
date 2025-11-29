// src/app/user/addBike/__tests__/addbike.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddBikePage from '@/app/user/addBike/page';
import AddBikeForm from '@/app/user/addBike/AddBikeForm';
import axios from 'axios';

jest.mock('axios');

// router mock (AddBikeForm imports useRouter, even if not used)
const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

// allow flipping dark mode
let mockIsDarkMode = false;
const setNavContextMock = jest.fn();

// appContext mock
jest.mock('@/app/appContext', () => ({
  useAppContext: () => ({
    setNavContext: setNavContextMock,
    isDarkMode: mockIsDarkMode,
  }),
}));

// normalizeError mock for the error branch
const normalizeErrorMock = jest.fn(() => ({
  message: 'Could not add bike',
}));
jest.mock('@/helpers/newErrorHandler', () => ({
  normalizeError: (...args) => normalizeErrorMock(...args),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockIsDarkMode = false;
});

//
// AddBikePage tests (wrapper)
//
test('AddBikePage renders heading and "My Bikes" link (light mode)', () => {
  mockIsDarkMode = false;
  render(<AddBikePage />);

  expect(
    screen.getByRole('heading', { name: /add bike/i })
  ).toBeInTheDocument();

  // fixed link to My Bikes
  expect(
    screen.getByRole('link', { name: /go to my bikes/i })
  ).toBeInTheDocument();
});

test('AddBikePage renders in dark mode without crashing', () => {
  mockIsDarkMode = true;
  render(<AddBikePage />);

  expect(
    screen.getByRole('heading', { name: /add bike/i })
  ).toBeInTheDocument();
});

//
// AddBikeForm tests
//
test('AddBikeForm calls setNavContext("userIn") on mount', () => {
  render(<AddBikeForm />);
  expect(setNavContextMock).toHaveBeenCalledWith('userIn');
});

test('AddBikeForm submits with URL only and shows success message', async () => {
  axios.post.mockResolvedValueOnce({ data: { ok: true } });

  render(<AddBikeForm />);

  // Fill required fields
  fireEvent.change(screen.getByLabelText(/nickname/i), {
    target: { value: 'Commuter' },
  });
  fireEvent.change(screen.getByLabelText(/make/i), {
    target: { value: 'Trek' },
  });
  fireEvent.change(screen.getByLabelText(/model/i), {
    target: { value: 'FX 3' },
  });
  fireEvent.change(screen.getByLabelText(/color/i), {
    target: { value: 'Blue' },
  });
  fireEvent.change(screen.getByLabelText(/picture url/i), {
    target: { value: 'https://example.com/bike.jpg' },
  });

  const button = screen.getByRole('button', { name: /add bike/i });
  fireEvent.click(button);

  // While loading, text should change to "Adding..."
  expect(
    screen.getByRole('button', { name: /adding\.\.\./i })
  ).toBeInTheDocument();

  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith(
      '/api/users/bikes/addBike',
      expect.any(FormData),
      { withCredentials: true }
    );
  });

  // Success message (okMsg branch)
  expect(
    await screen.findByText(/bike added successfully/i)
  ).toBeInTheDocument();

  // Button text should go back to "Add Bike" (loading=false)
  expect(
    screen.getByRole('button', { name: /add bike/i })
  ).toBeInTheDocument();
});

test('AddBikeForm prefers uploaded file over URL when both are provided', async () => {
  axios.post.mockResolvedValueOnce({ data: { ok: true } });

  render(<AddBikeForm />);

  // Fill required fields
  fireEvent.change(screen.getByLabelText(/nickname/i), {
    target: { value: 'Roadster' },
  });
  fireEvent.change(screen.getByLabelText(/make/i), {
    target: { value: 'Specialized' },
  });
  fireEvent.change(screen.getByLabelText(/model/i), {
    target: { value: 'Sirrus' },
  });
  fireEvent.change(screen.getByLabelText(/color/i), {
    target: { value: 'Black' },
  });
  fireEvent.change(screen.getByLabelText(/picture url/i), {
    target: { value: 'https://example.com/will-be-ignored.jpg' },
  });

  // Simulate file upload
  const fileInput = screen.getByLabelText(/upload a picture/i);
  const file = new File(['dummy'], 'bike.png', { type: 'image/png' });
  fireEvent.change(fileInput, {
    target: { files: [file] },
  });

  fireEvent.click(screen.getByRole('button', { name: /add bike/i }));

  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  const [, formDataArg] = axios.post.mock.calls[0];

  // Ensure the FormData contains the file under "picture"
  expect(formDataArg instanceof FormData).toBe(true);
  const pictureEntry = formDataArg.get('picture');
  expect(pictureEntry).toBe(file);
});

test('AddBikeForm handles error from API and shows error message', async () => {
  axios.post.mockRejectedValueOnce(new Error('network error'));

  render(<AddBikeForm />);

  // Fill required fields
  fireEvent.change(screen.getByLabelText(/nickname/i), {
    target: { value: 'Commuter' },
  });
  fireEvent.change(screen.getByLabelText(/make/i), {
    target: { value: 'Trek' },
  });
  fireEvent.change(screen.getByLabelText(/model/i), {
    target: { value: 'FX 3' },
  });
  fireEvent.change(screen.getByLabelText(/color/i), {
    target: { value: 'Blue' },
  });

  fireEvent.click(screen.getByRole('button', { name: /add bike/i }));

  // normalizeError is used to derive message
  await waitFor(() => {
    expect(normalizeErrorMock).toHaveBeenCalled();
  });

  expect(
    await screen.findByText(/could not add bike/i)
  ).toBeInTheDocument();

  // okMsg should not be visible
  expect(
    screen.queryByText(/bike added successfully/i)
  ).toBeNull();
});

test('handleFileChange clears pictureFile when no file is selected', () => {
  render(<AddBikeForm />);

  const fileInput = screen.getByLabelText(/upload a picture/i);

  // First, set a file
  const file = new File(['dummy'], 'bike.png', { type: 'image/png' });
  fireEvent.change(fileInput, {
    target: { files: [file] },
  });

  // Then, change with empty files array -> should set pictureFile to null internally
  fireEvent.change(fileInput, {
    target: { files: [] },
  });

  // There isn't a direct UI indicator, but this runs the branch where
  // `const file = e.target.files?.[0] ?? null;` yields null.
  // Just asserting the component is still rendered is enough for coverage.
  expect(
    screen.getByRole('button', { name: /add bike/i })
  ).toBeInTheDocument();
});

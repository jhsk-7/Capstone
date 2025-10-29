import { render, screen, fireEvent  } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import AppointmentPage from '@/app/user/appointment/page';

jest.mock('axios');

test('renders and has disabled "Book Appointment" button initially', async () => {
  // Mock the three GETs made in useEffect
  axios.get
    .mockResolvedValueOnce({ data: { data: { _id: 'user123' } } }) // /validUser
    .mockResolvedValueOnce({ data: { data: [] } })                 // /myBikes
    .mockResolvedValueOnce({ data: { data: [] } });                // /services

  render(<AppointmentPage />);

  // Heading shows
  expect(
    screen.getByRole('heading', { name: /book a service appointment/i })
  ).toBeInTheDocument();

  // Submit starts disabled (no date, no selected bikes)
  expect(
    screen.getByRole('button', { name: /book appointment/i })
  ).toBeDisabled();
});


test('enables "Book Appointment" after choosing a date and a bike', async () => {
  // Mock initial loads: user, bikes, services
  axios.get
    .mockResolvedValueOnce({ data: { data: { _id: 'user123' } } }) // /validUser
    .mockResolvedValueOnce({
      data: {
        data: [{ _id: 'b1', nickname: 'Commuter', make: 'Trek', model: 'FX' }],
      },
    }) // /myBikes
    .mockResolvedValueOnce({ data: { data: [{ _id: 's1', name: 'Wash' }] } }); // /services

  render(<AppointmentPage />);

  // Wait for the list UI to be present (lets the effect finish and avoids act warnings)
  expect(await screen.findByText(/select bikes & services/i)).toBeInTheDocument();

  // Grab the date input directly (label isn't associated; role queries won't find it reliably)
  const dateInput = document.querySelector('input[type="date"]');
  expect(dateInput).toBeInTheDocument();

  // Build a date string >= min (today), matching component format
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  // Set the date value (jsdom handles date inputs via change events)
  fireEvent.change(dateInput, { target: { value: todayStr } });

  // Select the bike checkbox
  const bikeCheckbox = await screen.findByRole('checkbox', { name: /commuter,\s*trek\s*fx/i });
  await userEvent.click(bikeCheckbox);

  // Button should now be enabled
  const submitBtn = screen.getByRole('button', { name: /book appointment/i });
  expect(submitBtn).toBeEnabled();
});


import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import AppointmentPage from '@/app/user/appointment/page';

jest.mock('axios');

test('submits with correct payload (userId, date, bikes & services)', async () => {
  // Mock initial loads: user, bikes, services
  axios.get
    .mockResolvedValueOnce({ data: { data: { _id: 'user123' } } }) // /validUser
    .mockResolvedValueOnce({
      data: {
        data: [{ _id: 'b1', nickname: 'Commuter', make: 'Trek', model: 'FX' }],
      },
    }) // /myBikes
    .mockResolvedValueOnce({
      data: { data: [{ _id: 's1', name: 'Wash', price: 15 }] },
    }); // /services

  // Mock POST success
  axios.post.mockResolvedValueOnce({ data: { ok: true } });

  // Silence window.alert (used by the component on success)
  const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

  render(<AppointmentPage />);

  // Wait for list to appear (ensures useEffect finished)
  expect(await screen.findByText(/select bikes & services/i)).toBeInTheDocument();

  // Set date (today)
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const dateInput = document.querySelector('input[type="date"]');
  fireEvent.change(dateInput, { target: { value: todayStr } });

  // Select bike
  const bikeCheckbox = await screen.findByRole('checkbox', { name: /commuter,\s*trek\s*fx/i });
  await userEvent.click(bikeCheckbox);

  // Select service
  const serviceCheckbox = await screen.findByRole('checkbox', { name: /wash/i });
  await userEvent.click(serviceCheckbox);

  // Submit
  await userEvent.click(screen.getByRole('button', { name: /book appointment/i }));

  // Assert POST call
  expect(axios.post).toHaveBeenCalledTimes(1);
  const [url, payload, options] = axios.post.mock.calls[0];
  expect(url).toBe('/api/users/appointment');
  expect(options).toMatchObject({ withCredentials: true });
  expect(payload).toEqual({
    userId: 'user123',
    date: todayStr,
    bikes: [{ bikeId: 'b1', services: ['s1'] }],
  });

  alertSpy.mockRestore();
});

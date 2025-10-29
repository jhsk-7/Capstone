import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import BikesPage from '@/app/user/myBikes/page';

jest.mock('axios');
const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));
test('shows empty state when no bikes are returned', async () => {
  axios.get.mockResolvedValueOnce({ data: { data: [] } }); // /api/users/bikes/myBikes

  render(<BikesPage />);

  expect(await screen.findByText(/no bikes found/i)).toBeInTheDocument();
});


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
          // picture omitted to use placeholder branch
        },
      ],
    },
  });

  render(<BikesPage />);

  // Bike nickname
  expect(await screen.findByText(/roadster/i)).toBeInTheDocument();

  // Make + model line
  expect(screen.getByText(/trek\s+fx/i)).toBeInTheDocument();

  // Color line
  expect(screen.getByText(/color:\s*blue/i)).toBeInTheDocument();
});


test('navigates to bike detail when a bike card is clicked', async () => {
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

  // Wait for the bike to render, then click somewhere inside the card (event bubbles to onClick)
  const nickname = await screen.findByText(/roadster/i);
  await userEvent.click(nickname);

  expect(pushMock).toHaveBeenCalledWith('/user/myBikes/b1');
});
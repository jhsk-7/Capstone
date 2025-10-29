import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from 'axios';

jest.mock('axios');
const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'b1' }),
  useRouter: () => ({ push: pushMock }),
}));

import BikeDetailPage from '@/app/user/myBikes/[id]/page';

test('renders bike details after loading', async () => {
  axios.get.mockResolvedValueOnce({
    data: { data: { _id: 'b1', nickname: 'Roadster', make: 'Trek', model: 'FX', color: 'Blue' } },
  });

  render(<BikeDetailPage />);

  // waits for loaded content
  expect(await screen.findByRole('heading', { name: /roadster/i })).toBeInTheDocument();
  expect(screen.getByText(/trek\s+fx/i)).toBeInTheDocument();
  expect(screen.getByText(/color:\s*blue/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /back to my bikes/i })).toBeInTheDocument();
});


test('deletes bike and redirects', async () => {
  // 1) Mock the initial GET and the DELETE
  axios.get.mockResolvedValueOnce({
    data: { data: { _id: 'b1', nickname: 'Roadster', make: 'Trek', model: 'FX', color: 'Blue' } },
  });
  axios.delete.mockResolvedValueOnce({ data: { message: 'Deleted' } });

  render(<BikeDetailPage />);

  // 2) Wait for the bike to load (heading shows nickname)
  await screen.findByRole('heading', { name: /roadster/i });

  const user = userEvent.setup();

  // 3) Click the page's top "Delete" button to open the confirm modal
  await user.click(screen.getByRole('button', { name: /delete/i }));

  // 4) Modal appears; confirm we see the prompt
  await screen.findByText(/delete bike\?/i);

  // 5) Click the modal's confirm Delete (there are now two "Delete" buttons — pick the last)
  const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i });
  await user.click(deleteButtons[deleteButtons.length - 1]);

  // 6) Assert the API call and redirect
  await waitFor(() => {
    expect(axios.delete).toHaveBeenCalledWith(
      '/api/users/bikes/myBikes/b1?cascade=1',
      { withCredentials: true }
    );
    expect(pushMock).toHaveBeenCalledWith('/user/myBikes?deleted=1');
  });
});
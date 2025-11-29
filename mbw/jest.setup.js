import '@testing-library/jest-dom';

jest.mock('mongoose', () => ({}));
jest.mock('mongodb', () => ({}));
jest.mock('bson', () => ({}));



// 🔧 Mock Next.js navigation hooks used in many pages
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
  useParams: () => ({ id: 'test-id' }),
}));

// 🔧 Mock your app context globally for tests
jest.mock('@/app/appContext', () => {
  const React = require('react');
  return {
    AppProvider: ({ children }) => <>{children}</>,
    useAppContext: () => ({
      isLoggedIn: true,
      setIsLoggedIn: jest.fn(),
      isAdminLoggedIn: true,
      setIsAdminLoggedIn: jest.fn(),
      navContext: null,
      setNavContext: jest.fn(), // <-- important to avoid "setNavContext is not a function"
      isDarkMode: false,
      setIsDarkMode: jest.fn(),
    }),
  };
});

// (optional) reset mocks between tests
afterEach(() => {
  jest.clearAllMocks();
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthPage } from '../components/AuthPage';

// Mock the AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn(),
    isAuthenticated: false,
  }),
  API_BASE_URL: 'http://localhost:5000'
}));

// Mock the safeFetch utility
vi.mock('../utils/safeFetch', () => ({
  safePost: vi.fn()
}));

describe('AuthPage', () => {
  it('renders login form by default', () => {
    render(<AuthPage />);
    expect(screen.getByText('تسجيل الدخول')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('switches to register form when clicking register tab', async () => {
    render(<AuthPage />);
    const registerTab = screen.getByText('إنشاء حساب');
    fireEvent.click(registerTab);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    });
  });

  it('shows error message on login failure', async () => {
    const { safePost } = await import('../utils/safeFetch');
    vi.mocked(safePost).mockResolvedValue({
      success: false,
      error: 'Invalid credentials'
    });

    render(<AuthPage />);
    
    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password' }
    });
    
    const submitButton = screen.getByText('تسجيل الدخول');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});

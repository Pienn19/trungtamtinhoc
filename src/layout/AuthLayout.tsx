import { type ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
};

export default AuthLayout;
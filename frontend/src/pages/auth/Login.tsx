import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during login');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="animate-fade-in max-w-lg ">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary-700">Welcome back</h2>
        <p className="mt-2 text-gray-600">Sign in to your account to continue</p>
      </div>
      
      {error && (
        <div className="bg-error-50 text-error-700 p-3 rounded-md mb-4 animate-fade-in">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          placeholder="Enter your email"
          leftIcon={<Mail className="h-5 w-5" />}
          autoComplete="email"
        />
        
        <Input
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          placeholder="Enter your password"
          leftIcon={<Lock className="h-5 w-5" />}
          autoComplete="current-password"
        />
        
        <div className="pt-2">
          <Button
            type="submit"
            isLoading={isLoading}
            fullWidth
            size="lg"
          >
            Sign in
          </Button>
        </div>
      </form>
      
      <p className="mt-8 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
          Sign up
        </Link>
      </p>
      
      {/* Demo credentials */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
        <p className="text-sm text-gray-600 mb-2 font-medium">Demo Credentials:</p>
        <p className="text-sm text-gray-600">Email: <span className="font-mono">alice@example.com</span></p>
        <p className="text-sm text-gray-600">Password: <span className="font-mono">(use any password)</span></p>
      </div>
    </div>
  );
};

export default Login;
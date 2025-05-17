import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!name) {
      setError('Name is required');
      return;
    }
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during registration');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary-700">Create your account</h2>
        <p className="mt-2 text-gray-600">Start sending documents for signature today</p>
      </div>
      
      {error && (
        <div className="bg-error-50 text-error-700 p-3 rounded-md mb-4 animate-fade-in">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Full Name"
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          placeholder="Enter your full name"
          leftIcon={<User className="h-5 w-5" />}
          autoComplete="name"
        />
        
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
          placeholder="Create a password"
          leftIcon={<Lock className="h-5 w-5" />}
          autoComplete="new-password"
          helperText="Password must be at least 6 characters"
        />
        
        <div className="pt-2">
          <Button
            type="submit"
            isLoading={isLoading}
            fullWidth
            size="lg"
          >
            Create Account
          </Button>
        </div>
      </form>
      
      <p className="mt-8 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;
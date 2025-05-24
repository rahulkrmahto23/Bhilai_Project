import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, InputGroup } from 'react-bootstrap';
import { FaUser, FaLock } from 'react-icons/fa';
import { loginUser, verifyAuth } from '../helpers/user-api';
import toast, { Toaster } from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await verifyAuth();
        if (authStatus.isAuthenticated) {
          navigate('/permit');
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(email, password, keepLoggedIn);
      if (response.success) {
        toast.success('Login successful! Redirecting...');
        setTimeout(() => navigate('/permit'), 1000);
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Toaster position="top-center" />
      <div className="bg-white p-4 rounded shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-4">
          <FaUser size={40} className="text-primary mb-2" />
          <h4>LOGIN e-PTW</h4>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text><FaUser /></InputGroup.Text>
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text><FaLock /></InputGroup.Text>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </InputGroup>
          </Form.Group>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <Form.Check
              type="checkbox"
              label="Keep me logged in"
              checked={keepLoggedIn}
              onChange={(e) => setKeepLoggedIn(e.target.checked)}
            />
          </div>

          <Button type="submit" variant="primary" className="w-100 mb-3">
            Login
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
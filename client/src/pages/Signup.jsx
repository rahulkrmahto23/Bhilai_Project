import React, { useState } from 'react';
import { Container, Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { signupUser } from '../helpers/user-api'; // adjust path if needed
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      const { name, email, password } = formData;
      const res = await signupUser(name, email, password); // role defaults to CLIENT
      setSuccess(res.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const backgroundStyle = {
    minHeight: '90vh',
    backgroundImage: 'url("/background.jpg")',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const formBoxStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0px 0px 10px rgba(0,0,0,0.3)',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
  };

  return (
    <div style={backgroundStyle}>
      <div style={formBoxStyle}>
        <div style={{ fontSize: '40px', color: '#0d6efd', marginBottom: '10px' }}>
          <FaUser />
        </div>
        <h4 className="mb-4">SIGN UP</h4>

        <Form onSubmit={handleSubmit}>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form.Group className="mb-3" controlId="signupUsername">
            <InputGroup>
              <InputGroup.Text><FaUser /></InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Username"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3" controlId="signupEmail">
            <InputGroup>
              <InputGroup.Text><FaEnvelope /></InputGroup.Text>
              <Form.Control
                type="email"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3" controlId="signupPassword">
            <InputGroup>
              <InputGroup.Text><FaLock /></InputGroup.Text>
              <Form.Control
                type="password"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-4" controlId="signupConfirmPassword">
            <InputGroup>
              <InputGroup.Text><FaLock /></InputGroup.Text>
              <Form.Control
                type="password"
                placeholder="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </InputGroup>
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100 mb-3">
            Sign Up
          </Button>

          <div style={{ fontSize: '0.9rem' }}>
            Already have an account? <a href="/">Login</a>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default SignupPage;

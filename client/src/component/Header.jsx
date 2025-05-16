import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import logo from '../assets/logo.jpeg';

const Header = () => {
  const headerStyle = {
    background: 'linear-gradient(to right, #0f1d4c, #002366)',
    color: 'white',
    padding: '7px',
  };

  return (
    <div style={headerStyle}>
      <Container fluid>
        <Row className="align-items-center">
          <Col md={6} className="d-flex align-items-center">
            <Image
              src={logo}
              alt="SAIL Logo"
              height="60"
              className="me-3"
            />
            <div>
              <div className="fw-bold" style={{ fontSize: '16px' }}>भिलाई इस्पात संयंत्र</div>
              <div className="fw-bold" style={{ fontSize: '16px' }}>BHILAI STEEL PLANT</div>
              <div style={{ fontSize: '14px' }}>सेल SAIL</div>
            </div>
          </Col>
          <Col md={6} className="text-end">
            <div style={{ fontSize: '20px', fontWeight: '500' }}>
              Safety Engineering Department
            </div>
            <div style={{ fontSize: '14px', marginTop: '4px' }}>
              Designed by Venkatpati Raju, Assistant Manager (Safety), 9407981839
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Header;

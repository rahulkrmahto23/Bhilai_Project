import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { FaSearch } from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Search = () => {
  const [poNumber, setPoNumber] = useState('');
  const [permitNumber, setPermitNumber] = useState('');
  const [permitStatus, setPermitStatus] = useState('ALL');
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [startDate, endDate] = dateRange;

  return (
    <Container className="py-5">
      <Card className="shadow-lg p-4 border-0 rounded-4">
        <h4 className="mb-4 text-primary fw-bold">🔍 Search Work Permit</h4>

        <Row className="mb-4 g-3">
          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-semibold">PO Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter PO Number"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="rounded-3"
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-semibold">Permit Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Permit Number"
                value={permitNumber}
                onChange={(e) => setPermitNumber(e.target.value)}
                className="rounded-3"
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-semibold">Permit Status</Form.Label>
              <Form.Select
                value={permitStatus}
                onChange={(e) => setPermitStatus(e.target.value)}
                className="rounded-3"
              >
                <option value="ALL">All</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="UNASSIGNED">Unassigned</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-semibold">Permit Issue Date Range</Form.Label>
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                isClearable
                className="form-control rounded-3"
                dateFormat="dd-MM-yyyy"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-4 g-3">
          <Col md={3}>
            <Button variant="outline-secondary" className="w-100 rounded-3">
              Clear Filter
            </Button>
          </Col>
          <Col md={3}>
            <Button variant="info" className="w-100 text-white rounded-3">
              Add/Update Favourite List
            </Button>
          </Col>
          <Col md={3}>
            <Button variant="primary" className="w-100 rounded-3">
              <FaSearch className="me-2" /> Search
            </Button>
          </Col>
        </Row>

        <hr />

        <Row className="g-3 mt-3">
          <Col md={3}>
            <Button variant="primary" className="w-100 rounded-3">
              Unassigned Permits
            </Button>
          </Col>

          <Col md={4}>
            <Button variant="secondary" className="w-100 rounded-3">
              Permit Assigned to Venkatpati Raju
            </Button>
          </Col>

          <Col md={3}>
            <Button variant="dark" className="w-100 rounded-3">
              <FaSearch className="me-2" /> Display Permits
            </Button>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default Search;

import React, { useState } from 'react';
import { Table, Button, Badge, Card, Form, Modal } from 'react-bootstrap';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import PermitForm from './AddPermitForm';

// Updated data with username instead of vehicle
const originalPermitData = [
  {
    status: 'Active',
    username: 'John Doe',
    area: 'P-kælder (Plads nr 2155)',
    poNumber: 'PO-001245',
    type: 'Standard Permit',
    issue: '21:40 - 24/04/2024',
    expiry: '21:40 - 24/04/2024',
  },
  {
    status: 'Expired',
    username: 'Alice Smith',
    area: '2 timer parkering',
    poNumber: 'PO-003111',
    type: 'Subscription',
    issue: '21:40 - 24/04/2024',
    expiry: '21:40 - 24/04/2024',
  },
  // ...add more entries as needed
];

const getStatusBadge = (status) => (
  <Badge bg={status === 'Active' ? 'success' : 'danger'}>{status}</Badge>
);

const PermitsTable = () => {
  const [sortedData, setSortedData] = useState([...originalPermitData]);
  const [sortOption, setSortOption] = useState('serial');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState(null);

  const navigate = useNavigate();

  const handleSearchClick = () => navigate('/search');
  const handleAddPermitClick = () => navigate('/add-permit');

  const handleSortChange = (e) => {
    const option = e.target.value;
    setSortOption(option);

    if (option === 'active') {
      setSortedData([
        ...originalPermitData.filter((p) => p.status === 'Active'),
        ...originalPermitData.filter((p) => p.status === 'Expired'),
      ]);
    } else if (option === 'expired') {
      setSortedData([
        ...originalPermitData.filter((p) => p.status === 'Expired'),
        ...originalPermitData.filter((p) => p.status === 'Active'),
      ]);
    } else {
      setSortedData([...originalPermitData]);
    }
  };

  const handleEditClick = (permit) => {
    setSelectedPermit(permit);
    setShowEditModal(true);
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setSelectedPermit(null);
  };

  return (
    <>
      <Card className="shadow-sm p-4 bg-light border-0">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button variant="outline-dark" onClick={handleSearchClick}>
            🔍 Search
          </Button>
          <div className="d-flex align-items-center">
            <Form.Select
              value={sortOption}
              onChange={handleSortChange}
              className="me-2"
              style={{ minWidth: '180px' }}
            >
              <option value="serial">Sort: As Given (Serial)</option>
              <option value="active">Sort: Active First</option>
              <option value="expired">Sort: Expired First</option>
            </Form.Select>
            <Button variant="primary" onClick={handleAddPermitClick}>
              + Add New Permit
            </Button>
          </div>
        </div>

        <Table responsive bordered hover className="bg-white text-center align-middle">
          <thead className="table-light">
            <tr>
              <th>Status</th>
              <th>Permit No.</th>
              <th>Type</th>
              <th>Issue Date</th>
              <th>Expiration Date</th>
              <th>Username</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(sortedData || []).map((permit, idx) => (
              <tr key={idx}>
                <td>{getStatusBadge(permit.status)}</td>
                <td>
                  <div className="fw-semibold">{permit.poNumber}</div>
                  <div className="text-muted small">{permit.area}</div>
                </td>
                <td>{permit.type}</td>
                <td>{permit.issue}</td>
                <td>{permit.expiry}</td>
                <td>{permit.username}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEditClick(permit)}
                  >
                    <FiEdit2 />
                  </Button>
                  <Button variant="outline-danger" size="sm">
                    <FiTrash2 />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal show={showEditModal} onHide={handleModalClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Permit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PermitForm
            defaultValues={selectedPermit}
            onClose={handleModalClose}
            isEdit={true}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PermitsTable;

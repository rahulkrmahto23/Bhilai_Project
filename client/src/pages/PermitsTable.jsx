import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Badge,
  Card,
  Form,
  Modal,
  Spinner,
  Alert,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import { FiEdit2, FiTrash2, FiSearch, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import PermitForm from "./AddPermitForm";
import { getAllPermits, deletePermit, verifyAuth, searchPermits } from "../helpers/user-api";
import toast, { Toaster } from "react-hot-toast";
import moment from "moment";

const statusColors = {
  Pending: "warning",
  Approved: "success",
  Rejected: "danger",
  Closed: "secondary",
};

const PermitsTable = () => {
  const [permits, setPermits] = useState([]);
  const [filteredPermits, setFilteredPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortConfig, setSortConfig] = useState({ key: "issueDate", direction: "desc" });
  const navigate = useNavigate();

  // Fetch permits on component mount
  useEffect(() => {
    const fetchPermits = async () => {
      try {
        setLoading(true);
        const auth = await verifyAuth();
        if (!auth.isAuthenticated) {
          navigate("/login");
          return;
        }

        const response = await getAllPermits();
        setPermits(response.permits);
        setFilteredPermits(response.permits);
      } catch (err) {
        setError(err.message || "Failed to fetch permits");
        toast.error(err.message || "Failed to fetch permits");
      } finally {
        setLoading(false);
      }
    };

    fetchPermits();
  }, [navigate]);

  // Apply filters and sorting whenever dependencies change
  useEffect(() => {
    let result = [...permits];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (permit) =>
          permit.permitNumber.toLowerCase().includes(term) ||
          permit.poNumber.toLowerCase().includes(term) ||
          permit.employeeName.toLowerCase().includes(term) ||
          permit.location.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      result = result.filter((permit) => permit.permitStatus === statusFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredPermits(result);
  }, [permits, searchTerm, statusFilter, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await searchPermits({
        searchTerm,
        permitStatus: statusFilter !== "ALL" ? statusFilter : null,
      });
      setPermits(response.permits);
    } catch (err) {
      toast.error(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (permit) => {
    setSelectedPermit({
      ...permit,
      issueDate: moment(permit.issueDate).format("YYYY-MM-DD"),
      expiryDate: moment(permit.expiryDate).format("YYYY-MM-DD"),
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this permit?")) return;

    try {
      setDeletingId(id);
      await deletePermit(id);
      setPermits(permits.filter((permit) => permit._id !== id));
      toast.success("Permit deleted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to delete permit");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePermitUpdated = (updatedPermit) => {
    setPermits(
      permits.map((permit) => (permit._id === updatedPermit._id ? updatedPermit : permit))
    );
    setShowEditModal(false);
    toast.success("Permit updated successfully");
  };

  const handleAddNewClick = () => {
    navigate("/add-permit");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-3">
        {error}
      </Alert>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <Card className="shadow-sm">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Permit Management</h5>
          <Button variant="primary" onClick={handleAddNewClick}>
            <FiPlus className="me-2" />
            Add New Permit
          </Button>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <InputGroup>
              <FormControl
                placeholder="Search permits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button variant="outline-secondary" onClick={handleSearch}>
                <FiSearch />
              </Button>
              <Form.Select
                style={{ width: "200px" }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Closed">Closed</option>
              </Form.Select>
            </InputGroup>
          </div>

          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th onClick={() => handleSort("permitNumber")}>
                    Permit #
                    {sortConfig.key === "permitNumber" && (
                      <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                    )}
                  </th>
                  <th onClick={() => handleSort("poNumber")}>
                    PO #
                    {sortConfig.key === "poNumber" && (
                      <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                    )}
                  </th>
                  <th onClick={() => handleSort("employeeName")}>
                    Employee
                    {sortConfig.key === "employeeName" && (
                      <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                    )}
                  </th>
                  <th>Type</th>
                  <th onClick={() => handleSort("permitStatus")}>
                    Status
                    {sortConfig.key === "permitStatus" && (
                      <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                    )}
                  </th>
                  <th onClick={() => handleSort("issueDate")}>
                    Issue Date
                    {sortConfig.key === "issueDate" && (
                      <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                    )}
                  </th>
                  <th onClick={() => handleSort("expiryDate")}>
                    Expiry Date
                    {sortConfig.key === "expiryDate" && (
                      <span>{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                    )}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPermits.length > 0 ? (
                  filteredPermits.map((permit) => (
                    <tr key={permit._id}>
                      <td>{permit.permitNumber}</td>
                      <td>{permit.poNumber}</td>
                      <td>{permit.employeeName}</td>
                      <td>{permit.permitType}</td>
                      <td>
                        <Badge bg={statusColors[permit.permitStatus] || "primary"}>
                          {permit.permitStatus}
                        </Badge>
                      </td>
                      <td>{moment(permit.issueDate).format("MMM D, YYYY")}</td>
                      <td>{moment(permit.expiryDate).format("MMM D, YYYY")}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEditClick(permit)}
                        >
                          <FiEdit2 />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteClick(permit._id)}
                          disabled={deletingId === permit._id}
                        >
                          {deletingId === permit._id ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <FiTrash2 />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No permits found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Edit Permit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Permit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPermit && (
            <PermitForm
              defaultValues={selectedPermit}
              onCancel={() => setShowEditModal(false)}
              onSubmit={handlePermitUpdated}
              isEditMode={true}
            />
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PermitsTable;
import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:8000'; // Ensure your Node server is running at this URL

function App() {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    employeeId: '',
    gender: '',
    image: '', // Initialize with an empty string
    editMode: false,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch employees from the backend
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/employees`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      } else {
        console.error('Failed to fetch employees:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { employeeId, name, position, email, phone, gender, image } = formData;

    const employeeData = {
      employeeId: employeeId,
      name: name,
      email: email,
      phone: phone,
      position: position,
      gender: gender,
      image: image, // Send the Base64 image string
    };

    console.log("Sending employee data:", employeeData); // Debugging log

    try {
      const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Employee updated successfully');
        fetchEmployees(); // Refresh the list of employees after update
      } else {
        console.error('Failed to save employee:', data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error occurred:', error.message);
    }
  };

  // Delete an employee
  const deleteEmployee = async (employeeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchEmployees();
      } else {
        console.error('Failed to delete employee:', response.statusText);
        alert("Error deleting employee. Please try again.");
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert("An error occurred while deleting the employee.");
    }
  };

  // Edit an employee's data
  const editEmployee = (employee) => {
    setFormData({ ...employee, editMode: true });
  };

  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search functionality
  const handleSearch = () => {
    if (searchTerm === '') {
      fetchEmployees(); // If the search term is empty, fetch all employees
    } else {
      const filteredEmployees = employees.filter((employee) =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setEmployees(filteredEmployees);
    }
  };

  // Reset search and fetch all employees
  const resetSearch = () => {
    setSearchTerm('');
    fetchEmployees(); // Fetch all employees when reset
  };

  // Handle image file change and convert to Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prevState) => ({
          ...prevState,
          image: reader.result, // Set the Base64 image data
        }));
      };
      reader.onerror = (err) => {
        console.error('Error reading image file:', err);
        alert('Error uploading image. Please try again.');
      };
      reader.readAsDataURL(file); // Convert image to Base64
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="employee-form">
          <h2>{formData.editMode ? 'Edit Employee' : 'Add Employee'}</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="employeeId"
              placeholder="Employee ID"
              value={formData.employeeId}
              onChange={handleInputChange}
              required
            />
            <div>
              <label>Gender:</label>
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={handleInputChange}
              /> Male
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={handleInputChange}
              /> Female
            </div>
            <select
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Position</option>
              <option value="Technician">Technician</option>
              <option value="Developer">Developer</option>
              <option value="Tester">Tester</option>
              <option value="Specialist">Specialist</option>
            </select>
            <input type="file" onChange={handleImageChange} />
            <button type="submit">{formData.editMode ? 'Update' : 'Submit'}</button>
          </form>
        </div>

        <div className="employee-list">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button onClick={handleSearch}>Search</button>
          <button onClick={resetSearch}>Reset</button>
          {loading && <p>Loading...</p>} {/* Show loading message */}
          {employees.map((employee) => (
            <div key={employee.employeeId} className="employee-card">
              <h3>{employee.name}</h3>
              <p>Email: {employee.email}</p>
              <p>Phone: {employee.phone}</p>
              <p>Position: {employee.position}</p>
              {employee.image ? (
                <img src={employee.image} alt={employee.name} />
              ) : (
                <img src="/fallback-image.jpg" alt="Fallback" /> // Provide fallback image
              )}
              <button onClick={() => editEmployee(employee)}>Edit</button>
              <button onClick={() => deleteEmployee(employee.employeeId)}>Delete</button>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;

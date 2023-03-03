import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import './App.css';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [file, setFile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isFileUploaded, setIsFileUploaded] = useState(false);

  const handleFileUpload = (event) => {
    const selectedFile = event.currentTarget.files[0];
    const fileType = selectedFile.type;
    const validTypes = ['text/csv', 'application/vnd.ms-excel'];

    
    if (validTypes.includes(fileType)) {
      setFile(selectedFile);
      setIsFileUploaded(true);
      const reader = new FileReader();
      reader.readAsText(selectedFile);
      reader.onload = () => {
        const rows = reader.result.split('\n').map(row => row.trim());
        const projectsMap = new Map();
        rows.forEach(row => {
          const [empId1, projectId1, dateFrom1, dateTo1] = row.split(',');
          rows.forEach(row2 => {
            const [empId2, projectId2, dateFrom2, dateTo2] = row2.split(',');
            if (empId1 !== empId2 && projectId1 === projectId2) {
              const daysWorked = calculateDaysWorked(dateFrom1, dateTo1, dateFrom2, dateTo2);
              const empIdPair = [empId1, empId2].sort((a, b) => a - b);
              const projectKey = empIdPair.join('-') + '-' + projectId1;
              const project = projectsMap.get(projectKey) || { id: uuidv4(), empId1: empIdPair[0], empId2: empIdPair[1], projectId: projectId1, daysWorked: 0 };
              project.daysWorked = daysWorked;
              projectsMap.set(projectKey, project);
            }
          });
        });
        //setProjects([...projectsMap.values()]);
        setProjects(Array.from(projectsMap.values()));

      }
    } else {
      alert('Please upload a CSV file.');
      event.target.value = null;
    }
  };

  const columns = [
    { field: 'empId1', headerName: 'Employee ID #1', width: 200 },
    { field: 'empId2', headerName: 'Employee ID #2', width: 200 },
    { field: 'projectId', headerName: 'Project ID', width: 200 },
    { field: 'daysWorked', headerName: 'Days worked', width: 200 },
  ];

  const calculateDaysWorked = (dateFrom1, dateTo1, dateFrom2, dateTo2) => {
    const d1 = dateFrom1 ? new Date(dateFrom1) : null;
    const d2 = (dateTo1 && dateTo1.includes("NULL")) ? new Date() : (dateTo1 ? new Date(dateTo1) : new Date());
    const d3 = dateFrom2 ? new Date(dateFrom2) : null;
    const d4 = (dateTo2 && dateTo2.includes("NULL")) ? new Date() : (dateTo2 ? new Date(dateTo2) : new Date());

    //console.log(dateTo1.replace(/ /g, ''));

    if (!d1 && !d3) {
      return 0;
    }
    
    const maxDateFrom = d1 && d3 ? (d1 > d3 ? d1 : d3) : (d1 || d3);

    const minDateTo = d2 && d4 ? (d2 < d4 ? d2 : d4) : (d2 || d4 || new Date());

    if (isNaN(maxDateFrom.getTime()) || isNaN(minDateTo.getTime())) {
      return 0;
    }

    if (maxDateFrom > minDateTo) return 0;
    
    const diffTime = minDateTo.getTime() - maxDateFrom.getTime();

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return ( 
    <div className={`app-container ${isFileUploaded ? 'expanded' : ''}`}>
      <h1 className="title">Upload CSV File</h1>
      <div className="file-upload-container">
        <label htmlFor="file-upload">
          <span>Upload file</span>
          <div className="liquid"></div>
        </label>
    <input id="file-upload" type="file" accept=".csv" onChange={handleFileUpload} />
      </div>
      {file && (
        <div className="file-info-container">
          <div className="table-container" style={{ height: 300, width: '100%'}}>
          <DataGrid rows={projects} columns={columns} pageSize={5} rowsPerPageOptions={[5, 10, 20]} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
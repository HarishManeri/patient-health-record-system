// SQLite Database Handler
let db;
let SQL;

// Initialize SQL.js
initSqlJs();

async function initSqlJs() {
    try {
        // Initialize the SQL.js library
        SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });
        
        // Create a new database
        db = new SQL.Database();
        
        // Create tables if they don't exist
        createTables();
        
        // Load saved database if exists
        loadDatabaseFromLocalStorage();
        
        console.log("SQL.js initialized successfully");
    } catch (error) {
        console.error("Error initializing SQL.js:", error);
        showMessage("Error initializing database. Please refresh the page.", true);
    }
}

function createTables() {
    db.run(`
        CREATE TABLE IF NOT EXISTS patients (
            id TEXT PRIMARY KEY,
            name TEXT,
            age INTEGER,
            gender TEXT,
            blood_group TEXT,
            medical_history TEXT,
            created_at TEXT
        )
    `);
}

function saveDatabaseToLocalStorage() {
    try {
        // Export the database to an Uint8Array containing the SQLite database file
        const data = db.export();
        // Convert the Uint8Array to a Base64 string
        const base64String = arrayBufferToBase64(data);
        // Save to localStorage
        localStorage.setItem('healthRecordDB', base64String);
    } catch (error) {
        console.error("Error saving database:", error);
    }
}

function loadDatabaseFromLocalStorage() {
    try {
        const savedDB = localStorage.getItem('healthRecordDB');
        if (savedDB) {
            // Convert the Base64 string back to a Uint8Array
            const uint8Array = base64ToArrayBuffer(savedDB);
            // Close the current database
            db.close();
            // Load the database from the Uint8Array
            db = new SQL.Database(uint8Array);
        }
    } catch (error) {
        console.error("Error loading database:", error);
        showMessage("Failed to load saved database. Starting with a new database.", true);
        // If there's an error, create a new database
        db = new SQL.Database();
        createTables();
    }
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// DOM Elements
const patientForm = document.getElementById('patientForm');
const patientIdInput = document.getElementById('patientId');
const patientNameInput = document.getElementById('patientName');
const patientAgeInput = document.getElementById('patientAge');
const patientGenderInput = document.getElementById('patientGender');
const patientBloodGroupInput = document.getElementById('patientBloodGroup');
const medicalHistoryInput = document.getElementById('medicalHistory');
const searchPatientIdInput = document.getElementById('searchPatientId');
const messageDiv = document.getElementById('message');
const patientDetailsDiv = document.getElementById('patientDetails');
const patientListDiv = document.getElementById('patientList');
const importFileInput = document.getElementById('importFile');

// Button Event Listeners
document.getElementById('addButton').addEventListener('click', addPatient);
document.getElementById('updateButton').addEventListener('click', updatePatient);
document.getElementById('clearButton').addEventListener('click', clearForm);
document.getElementById('searchButton').addEventListener('click', searchPatient);
document.getElementById('deleteButton').addEventListener('click', deletePatient);
document.getElementById('listAllButton').addEventListener('click', listAllPatients);
document.getElementById('exportButton').addEventListener('click', exportDatabase);
importFileInput.addEventListener('change', importDatabase);

// Functions
function showMessage(message, isError = false) {
    messageDiv.textContent = message;
    messageDiv.className = isError ? 'message error' : 'message success';
    
    // Clear the message after 5 seconds
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }, 5000);
}

function clearForm() {
    patientForm.reset();
    patientDetailsDiv.innerHTML = '';
}

function getFormData() {
    const id = patientIdInput.value.trim();
    if (!id) {
        showMessage('Patient ID is required', true);
        return null;
    }
    
    return {
        id: id,
        name: patientNameInput.value.trim(),
        age: patientAgeInput.value ? parseInt(patientAgeInput.value) : null,
        gender: patientGenderInput.value,
        bloodGroup: patientBloodGroupInput.value.trim(),
        medicalHistory: medicalHistoryInput.value.trim(),
        createdAt: new Date().toISOString()
    };
}

function fillFormWithPatient(patient) {
    patientIdInput.value = patient.id || '';
    patientNameInput.value = patient.name || '';
    patientAgeInput.value = patient.age || '';
    patientGenderInput.value = patient.gender || '';
    patientBloodGroupInput.value = patient.bloodGroup || '';
    medicalHistoryInput.value = patient.medicalHistory || '';
}

// SQLite Database Functions
function addPatient() {
    try {
        const patientData = getFormData();
        if (!patientData) return;
        
        // Check if patient with same ID already exists
        const existingPatient = db.exec(`SELECT id FROM patients WHERE id = '${patientData.id}'`);
        if (existingPatient.length > 0 && existingPatient[0].values.length > 0) {
            showMessage(`Patient with ID '${patientData.id}' already exists. Use update instead.`, true);
            return;
        }
        
        // Insert patient data
        db.run(`
            INSERT INTO patients (id, name, age, gender, blood_group, medical_history, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            patientData.id, 
            patientData.name, 
            patientData.age, 
            patientData.gender, 
            patientData.bloodGroup, 
            patientData.medicalHistory, 
            patientData.createdAt
        ]);
        
        // Save database to localStorage
        saveDatabaseToLocalStorage();
        
        showMessage('Patient added successfully!');
        clearForm();
    } catch (error) {
        console.error('Error adding patient:', error);
        showMessage('Failed to add patient', true);
    }
}

function updatePatient() {
    try {
        const patientData = getFormData();
        if (!patientData) return;
        
        // Check if patient exists
        const existingPatient = db.exec(`SELECT id FROM patients WHERE id = '${patientData.id}'`);
        if (existingPatient.length === 0 || existingPatient[0].values.length === 0) {
            showMessage(`Patient with ID '${patientData.id}' not found.`, true);
            return;
        }
        
        // Update patient data
        db.run(`
            UPDATE patients
            SET name = ?, age = ?, gender = ?, blood_group = ?, medical_history = ?
            WHERE id = ?
        `, [
            patientData.name, 
            patientData.age, 
            patientData.gender, 
            patientData.bloodGroup, 
            patientData.medicalHistory, 
            patientData.id
        ]);
        
        // Save database to localStorage
        saveDatabaseToLocalStorage();
        
        showMessage('Patient updated successfully!');
    } catch (error) {
        console.error('Error updating patient:', error);
        showMessage('Failed to update patient', true);
    }
}

function searchPatient() {
    try {
        const patientId = searchPatientIdInput.value.trim();
        if (!patientId) {
            showMessage('Please enter a Patient ID to search', true);
            return;
        }
        
        // Query the database
        const result = db.exec(`
            SELECT id, name, age, gender, blood_group as bloodGroup, medical_history as medicalHistory, created_at as createdAt
            FROM patients
            WHERE id = '${patientId}'
        `);
        
        if (result.length > 0 && result[0].values.length > 0) {
            // Convert row to object
            const patient = {};
            result[0].columns.forEach((column, index) => {
                patient[column] = result[0].values[0][index];
            });
            
            displayPatientDetails(patient);
            fillFormWithPatient(patient);
        } else {
            showMessage(`Patient with ID '${patientId}' not found.`, true);
            patientDetailsDiv.innerHTML = '';
        }
    } catch (error) {
        console.error('Error searching patient:', error);
        showMessage('Failed to search patient', true);
    }
}

function deletePatient() {
    try {
        const patientId = searchPatientIdInput.value.trim();
        if (!patientId) {
            showMessage('Please enter a Patient ID to delete', true);
            return;
        }
        
        // Check if patient exists
        const existingPatient = db.exec(`SELECT id FROM patients WHERE id = '${patientId}'`);
        if (existingPatient.length === 0 || existingPatient[0].values.length === 0) {
            showMessage(`Patient with ID '${patientId}' not found.`, true);
            return;
        }
        
        // Confirm deletion
        if (!confirm(`Are you sure you want to delete patient with ID: ${patientId}?`)) {
            return;
        }
        
        // Delete the patient
        db.run(`DELETE FROM patients WHERE id = ?`, [patientId]);
        
        // Save database to localStorage
        saveDatabaseToLocalStorage();
        
        showMessage('Patient deleted successfully!');
        patientDetailsDiv.innerHTML = '';
        
        // Clear the form if it's showing the deleted patient
        if (patientIdInput.value === patientId) {
            clearForm();
        }
    } catch (error) {
        console.error('Error deleting patient:', error);
        showMessage('Failed to delete patient', true);
    }
}

function listAllPatients() {
    try {
        // Query all patients
        const result = db.exec(`
            SELECT id, name, age, gender, blood_group as bloodGroup
            FROM patients
            ORDER BY name
        `);
        
        // Display results
        if (result.length > 0) {
            const patients = [];
            
            result[0].values.forEach(row => {
                const patient = {};
                result[0].columns.forEach((column, index) => {
                    patient[column] = row[index];
                });
                patients.push(patient);
            });
            
            displayPatientList(patients);
        } else {
            patientListDiv.innerHTML = '<p>No patients found in the database.</p>';
        }
    } catch (error) {
        console.error('Error listing patients:', error);
        showMessage('Failed to list patients', true);
    }
}

function exportDatabase() {
    try {
        // Export the database to an Uint8Array containing the SQLite database file
        const data = db.export();
        
        // Create a Blob from the data
        const blob = new Blob([data], { type: 'application/x-sqlite3' });
        
        // Create a download link
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'patient_records.db';
        
        // Trigger the download
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        showMessage('Database exported successfully!');
    } catch (error) {
        console.error('Error exporting database:', error);
        showMessage('Failed to export database', true);
    }
}

function importDatabase(event) {
    try {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                // Get the file content as an ArrayBuffer
                const arrayBuffer = e.target.result;
                
                // Create a new database from the imported file
                const newDb = new SQL.Database(new Uint8Array(arrayBuffer));
                
                // Check if the imported database has the correct schema
                try {
                    const tables = newDb.exec("SELECT name FROM sqlite_master WHERE type='table'");
                    const hasPatientTable = tables.length > 0 && 
                        tables[0].values.some(row => row[0] === 'patients');
                    
                    if (!hasPatientTable) {
                        throw new Error('Invalid database structure');
                    }
                    
                    // Close the current database
                    db.close();
                    
                    // Replace with the new database
                    db = newDb;
                    
                    // Save the imported database to localStorage
                    saveDatabaseToLocalStorage();
                    
                    showMessage('Database imported successfully!');
                    
                    // Refresh the patient list
                    listAllPatients();
                } catch (error) {
                    console.error('Error validating imported database:', error);
                    showMessage('The imported file is not a valid patient database.', true);
                    newDb.close();
                }
            } catch (error) {
                console.error('Error processing imported file:', error);
                showMessage('Failed to import database file', true);
            }
        };
        
        reader.onerror = function() {
            showMessage('Error reading the file', true);
        };
        
        // Read the file as an ArrayBuffer
        reader.readAsArrayBuffer(file);
    } catch (error) {
        console.error('Error importing database:', error);
        showMessage('Failed to import database', true);
    }
}

function displayPatientDetails(patient) {
    let html = `
        <h3>Patient Details</h3>
        <table>
            <tr>
                <th>ID</th>
                <td>${patient.id || ''}</td>
            </tr>
            <tr>
                <th>Name</th>
                <td>${patient.name || ''}</td>
            </tr>
            <tr>
                <th>Age</th>
                <td>${patient.age || ''}</td>
            </tr>
            <tr>
                <th>Gender</th>
                <td>${patient.gender || ''}</td>
            </tr>
            <tr>
                <th>Blood Group</th>
                <td>${patient.bloodGroup || ''}</td>
            </tr>
            <tr>
                <th>Medical History</th>
                <td>${patient.medicalHistory || ''}</td>
            </tr>
        </table>
    `;
    
    patientDetailsDiv.innerHTML = html;
}

function displayPatientList(patients) {
    if (patients.length === 0) {
        patientListDiv.innerHTML = '<p>No patients found.</p>';
        return;
    }
    
    let html = `
        <h3>Patient List (${patients.length} patients)</h3>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Blood Group</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    patients.forEach(patient => {
        html += `
            <tr>
                <td>${patient.id || ''}</td>
                <td>${patient.name || ''}</td>
                <td>${patient.age || ''}</td>
                <td>${patient.gender || ''}</td>
                <td>${patient.bloodGroup || ''}</td>
                <td>
                    <button onclick="loadPatient('${patient.id}')">View</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    patientListDiv.innerHTML = html;
}

// Global function for the table buttons
window.loadPatient = function(patientId) {
    searchPatientIdInput.value = patientId;
    searchPatient();
};
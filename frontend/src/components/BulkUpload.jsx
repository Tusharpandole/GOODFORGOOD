import { useState } from 'react';
import api from '../api';

function BulkUpload() {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [jobId, setJobId] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a CSV file');
            return;
        }
        const formData = new FormData();
        formData.append('file', file); // Ensure key is 'file'
        try {
            const response = await api.post('/api/reports/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setJobId(response.data.job_id);
            setError('');
            alert(`File uploaded successfully. Job ID: ${response.data.job_id}`);
        } catch (err) {
            const errorMessage = err.response?.data ? JSON.stringify(err.response.data) : err.message;
            setError(`Upload failed: ${errorMessage}`);
            console.error('Upload error:', err.response || err);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            setError('');
        } else {
            setError('Please select a valid CSV file');
            setFile(null);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold">Bulk Upload</h2>
            <form onSubmit={handleSubmit} className="p-4 bg-gray-100 rounded">
                <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileChange}
                    className="p-2 m-2 border rounded w-full"
                    required
                />
                <button
                    type="submit"
                    disabled={!file}
                    className="p-2 m-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
                >
                    Upload
                </button>
                {error && <p className="text-red-500 m-2">{error}</p>}
                {jobId && <p className="text-green-500 m-2">Job ID: {jobId}</p>}
            </form>
        </div>
    );
}

export default BulkUpload;
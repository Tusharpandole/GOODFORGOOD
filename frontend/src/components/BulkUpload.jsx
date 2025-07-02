import { useState } from 'react';
import axios from 'axios';

function BulkUpload() {
    const [file, setFile] = useState(null);
    const [jobId, setJobId] = useState('');
    const [status, setStatus] = useState(null);
    const [error, setError] = useState('');

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/reports/upload`, formData);
            setJobId(response.data.job_id);
            setError('');
            pollStatus(response.data.job_id);
        } catch (err) {
            const errorMessage = err.response?.data ? JSON.stringify(err.response.data) : 'Upload failed';
            setError(errorMessage);
            console.error('Upload error:', err);
        }
    };

    const pollStatus = async (jobId) => {
        let attempts = 0;
        const maxAttempts = 30; // 90 seconds
        const interval = setInterval(async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/job-status/${jobId}`);
                setStatus(response.data);
                console.log(`Poll status for job_id ${jobId}:`, response.data);
                if (response.data.status === 'completed' || response.data.status === 'failed' || response.data.status === 'error' || attempts >= maxAttempts) {
                    clearInterval(interval);
                    if (attempts >= maxAttempts) {
                        setError('Status check timed out after 90 seconds. Check Redis connection.');
                        setStatus({ status: 'error', errors: ['Timed out after 90 seconds'] });
                        console.error(`Job ${jobId} timed out: ensure Redis is running at 127.0.0.1:6379`);
                    } else if (response.data.status === 'error') {
                        setError(`Job error: ${response.data.errors.join(', ')}`);
                        console.error(`Job ${jobId} failed: ${response.data.errors.join(', ')}`);
                    }
                }
                attempts++;
            } catch (err) {
                setStatus({ status: 'error', errors: ['Failed to fetch status'] });
                const errorMsg = err.response?.data?.error || err.message;
                setError(`Status check failed: ${errorMsg}. Check Redis connection.`);
                console.error(`Poll error for job_id ${jobId}:`, err.response || err);
                console.error(`Possible Redis connectivity issue: ${errorMsg}. Verify Redis is running at 127.0.0.1:6379`);
                clearInterval(interval);
            }
        }, 3000);
    };
    return (
        <div className="p-4 bg-gray-100 rounded">
            <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} className="p-2 m-2" />
            <button onClick={handleUpload} className="p-2 m-2 bg-blue-500 text-white rounded">Upload</button>
            {error && <p className="text-red-500 m-2">{error}</p>}
            {jobId && <p className="m-2">Job ID: {jobId}</p>}
            {status && (
                <div className="m-2">
                    <p>Status: {status.status} ({status.processed}/{status.total} rows processed)</p>
                    {status.errors?.length > 0 && <p className="text-red-500">Errors: {status.errors.join(', ')}</p>}
                </div>
            )}
        </div>
    );
}

export default BulkUpload;
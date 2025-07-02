import { useState } from 'react';
import api from '../api';

function ReportForm() {
    const [formData, setFormData] = useState({
        ngo_id: '',
        month: '',
        people_helped: '',
        events_conducted: '',
        funds_utilized: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/api/report', formData);
            alert('Report submitted successfully: ' + JSON.stringify(response.data));
            setFormData({ ngo_id: '', month: '', people_helped: '', events_conducted: '', funds_utilized: '' });
            setError('');
        } catch (err) {
            const errorMessage = err.response?.data ? JSON.stringify(err.response.data) : err.message;
            setError(`Submission failed: ${errorMessage}`);
            console.error('Submission error:', err.response || err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-100 rounded">
            <input
                type="text"
                placeholder="NGO ID"
                value={formData.ngo_id}
                onChange={(e) => setFormData({ ...formData, ngo_id: e.target.value })}
                className="p-2 m-2 border rounded w-full"
                required
            />
            <input
                type="text"
                placeholder="Month (YYYY-MM)"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="p-2 m-2 border rounded w-full"
                required
                pattern="\d{4}-\d{2}"
                title="Enter month in YYYY-MM format"
            />
            <input
                type="number"
                placeholder="People Helped"
                value={formData.people_helped}
                onChange={(e) => setFormData({ ...formData, people_helped: e.target.value })}
                className="p-2 m-2 border rounded w-full"
                required
                min="0"
            />
            <input
                type="number"
                placeholder="Events Conducted"
                value={formData.events_conducted}
                onChange={(e) => setFormData({ ...formData, events_conducted: e.target.value })}
                className="p-2 m-2 border rounded w-full"
                required
                min="0"
            />
            <input
                type="number"
                placeholder="Funds Utilized"
                value={formData.funds_utilized}
                onChange={(e) => setFormData({ ...formData, funds_utilized: e.target.value })}
                className="p-2 m-2 border rounded w-full"
                required
                min="0"
                step="0.01"
            />
            <button type="submit" className="p-2 m-2 bg-blue-500 text-white rounded">Submit</button>
            {error && <p className="text-red-500 m-2">{error}</p>}
        </form>
    );
}

export default ReportForm;
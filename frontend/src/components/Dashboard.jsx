import { useState, useEffect } from 'react';
import api from '../api';

function Dashboard() {
    const [month, setMonth] = useState('2025-07');
    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');

    const fetchReports = async () => {
        try {
            const response = await api.get(`/api/dashboard?month=${month}`);
            setReports(response.data);
            setError('');
        } catch (err) {
            const errorMessage = err.response?.data ? JSON.stringify(err.response.data) : err.message;
            setError(`Failed to fetch reports: ${errorMessage}`);
            console.error('Fetch error:', err.response || err);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [month]);

    const handleMonthChange = (e) => {
        setMonth(e.target.value);
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold">Dashboard</h2>
            <input
                type="text"
                placeholder="Month (YYYY-MM)"
                value={month}
                onChange={handleMonthChange}
                className="p-2 m-2 border rounded w-full"
                pattern="\d{4}-\d{2}"
                title="Enter month in YYYY-MM format"
            />
            <button
                onClick={fetchReports}
                className="p-2 m-2 bg-blue-500 text-white rounded"
            >
                Fetch Reports
            </button>
            {error && <p className="text-red-500 m-2">{error}</p>}
            <div>
                {reports.length > 0 ? (
                    <table className="table-auto w-full border">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2">NGO ID</th>
                                <th className="border px-4 py-2">Month</th>
                                <th className="border px-4 py-2">People Helped</th>
                                <th className="border px-4 py-2">Events Conducted</th>
                                <th className="border px-4 py-2">Funds Utilized</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report, index) => (
                                <tr key={index}>
                                    <td className="border px-4 py-2">{report.ngo_id}</td>
                                    <td className="border px-4 py-2">{report.month}</td>
                                    <td className="border px-4 py-2">{report.people_helped}</td>
                                    <td className="border px-4 py-2">{report.events_conducted}</td>
                                    <td className="border px-4 py-2">{report.funds_utilized}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No reports found for {month}</p>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
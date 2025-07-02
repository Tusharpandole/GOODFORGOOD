import { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
    const [month, setMonth] = useState('2025-01');
    const [data, setData] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard?month=${month}`);
                setData(response.data);
                setError('');
            } catch (err) {
                setError('Failed to fetch dashboard data');
            }
        };
        fetchData();
    }, [month]);

    return (
        <div className="p-4 bg-gray-100 rounded">
            <input
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="Month (YYYY-MM)"
                className="p-2 m-2 border rounded w-full"
            />
            {error && <p className="text-red-500 m-2">{error}</p>}
            <div className="m-2">
                <p>Total NGOs: {data.total_ngos || 0}</p>
                <p>Total People Helped: {data.total_people_helped || 0}</p>
                <p>Total Events: {data.total_events || 0}</p>
                <p>Total Funds: ${data.total_funds?.toFixed(2) || '0.00'}</p>
            </div>
        </div>
    );
}

export default Dashboard;
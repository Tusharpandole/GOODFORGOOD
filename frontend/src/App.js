import { useState } from 'react';
import ReportForm from './components/ReportForm';
import BulkUpload from './components/BulkUpload';
import Dashboard from './components/Dashboard';

function App() {
    const [activeTab, setActiveTab] = useState('report');

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">GOODFORGOOD NGO Reporting System</h1>
            <div className="tabs flex space-x-2 mb-4">
                <button onClick={() => setActiveTab('report')} className={`p-2 ${activeTab === 'report' ? 'bg-blue-700' : 'bg-blue-500'} text-white rounded`}>Submit Report</button>
                <button onClick={() => setActiveTab('upload')} className={`p-2 ${activeTab === 'upload' ? 'bg-blue-700' : 'bg-blue-500'} text-white rounded`}>Bulk Upload</button>
                <button onClick={() => setActiveTab('dashboard')} className={`p-2 ${activeTab === 'dashboard' ? 'bg-blue-700' : 'bg-blue-500'} text-white rounded`}>Dashboard</button>
            </div>
            {activeTab === 'report' && <ReportForm />}
            {activeTab === 'upload' && <BulkUpload />}
            {activeTab === 'dashboard' && <Dashboard />}
        </div>
    );
}

export default App;
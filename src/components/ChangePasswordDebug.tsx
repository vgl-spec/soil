import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const ChangePasswordDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testData, setTestData] = useState({
    currentPassword: 'test123',
    newPassword: 'newtest123'
  });

  const testEndpoint = async () => {
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      console.log('User data from localStorage:', user);

      if (!user?.id) {
        setDebugInfo({ error: 'No user ID found in localStorage' });
        return;
      }

      // Test the endpoint
      const response = await axios.post(`${API_BASE_URL}/test_change_password_endpoint.php`, {
        user_id: user.id,
        current_password: testData.currentPassword,
        new_password: testData.newPassword
      });

      setDebugInfo({
        success: true,
        response: response.data,
        userFromStorage: user
      });
    } catch (error: any) {
      console.error('Test endpoint error:', error);
      setDebugInfo({
        error: 'Test endpoint failed',
        details: error.message,
        response: error.response?.data
      });
    }
  };

  const testActualChangePassword = async () => {
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      const response = await axios.post(`${API_BASE_URL}/change_password.php`, {
        user_id: user.id,
        current_password: testData.currentPassword,
        new_password: testData.newPassword
      });

      setDebugInfo({
        actualTest: true,
        response: response.data
      });
    } catch (error: any) {
      console.error('Actual change password error:', error);
      setDebugInfo({
        actualTest: true,
        error: 'Change password failed',
        details: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-4">Change Password Debug Tool</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Test Current Password:</label>
          <input
            type="password"
            value={testData.currentPassword}
            onChange={(e) => setTestData({ ...testData, currentPassword: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Test New Password:</label>
          <input
            type="password"
            value={testData.newPassword}
            onChange={(e) => setTestData({ ...testData, newPassword: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={testEndpoint}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Endpoint
          </button>
          
          <button
            onClick={testActualChangePassword}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test Actual Change Password
          </button>
        </div>

        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h4 className="font-bold mb-2">Debug Information:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordDebug;

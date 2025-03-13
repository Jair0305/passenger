// Test page to generate passes
'use client';

import { useState } from 'react';
import axios from 'axios';

export default function TestPassPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePass = async () => {
    try {
      setLoading(true);
      setError(null);

      // Sample data for testing
      const passData = {
        passType: 'generic',
        passData: {
          title: 'Test Pass',
          subtitle: 'Subtitle',
          description: 'Test Pass Description',
          logoText: 'Test Company',
          organizationName: 'Test Organization',
          
          // Colors
          primaryColor: '#FF0000',
          secondaryColor: '#0000FF',
          backgroundColor: '#FFFFFF',
          foregroundColor: '#000000',
          labelColor: '#666666',
          
          // Location and dates
          location: 'Sample Location',
          date: '2023-12-31',
          time: '14:30',
          
          // Options
          barcode: true,
          barcodeFormat: 'PKBarcodeFormatQR',
          barcodeMessage: 'TEST-PASS-123456',
          notifications: true,
          
          // Custom fields
          customFields: [
            {
              key: 'custom1',
              label: 'Custom Field 1',
              value: 'Custom Value 1',
              textAlignment: 'left'
            },
            {
              key: 'custom2',
              label: 'Custom Field 2',
              value: 'Custom Value 2',
              textAlignment: 'right'
            }
          ]
        }
      };

      // Call the API to generate the pass
      const response = await axios.post('/api/passes', passData, {
        responseType: 'blob'
      });

      // Create a download link for the pass
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `test-pass-${Date.now()}.pkpass`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error('Error generating pass:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Apple Wallet Pass Generator Test</h1>
      
      <button
        onClick={handleGeneratePass}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Generating...' : 'Generate Test Pass'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Certificate Status</h2>
        <p>To check the certificate status, visit <a href="/api/passes" className="text-blue-500 underline">this link</a>.</p>
      </div>
    </div>
  );
} 
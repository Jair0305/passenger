'use client';

import { useState } from 'react';
import axios from 'axios';

export default function GenericPassPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleGeneratePass = async () => {
    try {
      setLoading(true);
      setError(null);
      setStatus("Generating pass...");

      // Very simple data for a generic pass
      const passData = {
        title: "Generic Pass",
        description: "A simple generic pass",
        logoText: "Test Company",
        location: "Test Location",
        date: "2023-12-31",
        barcode: true,
        barcodeMessage: "GENERIC-TEST-123",
        foregroundColor: "#000000",
        backgroundColor: "#FFFFFF",
        labelColor: "#888888",
        customFields: [
          {
            key: "custom1",
            label: "Custom Field",
            value: "Custom Value",
            textAlignment: "left"
          }
        ]
      };

      // Call the API to generate the pass
      const response = await axios.post('/api/generic-pass', passData, {
        responseType: 'blob'
      });

      setStatus("Pass generated successfully! Downloading...");

      // Create a download link for the pass
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `generic-pass-${Date.now()}.pkpass`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      
      setStatus("Pass downloaded. Open it on your iOS device.");
    } catch (err) {
      console.error('Error generating pass:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Generic Apple Wallet Pass Generator</h1>
      <p className="mb-4">This page generates a simple generic pass with fixed values.</p>
      
      <button
        onClick={handleGeneratePass}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Generating...' : 'Generate Generic Pass'}
      </button>

      {status && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
          <strong>Status:</strong> {status}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">About This Test</h2>
        <p>This is a simplified version that only creates a generic pass with hardcoded values to verify the basic functionality.</p>
      </div>
    </div>
  );
} 
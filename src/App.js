import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('');

  const handleRun = async () => {
    if (!file) return alert('Please upload a file');

    // Upload the file
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    const uploadRes = await fetch('https://ai-gpu-backend.fly.dev/upload', {
      method: 'POST',
      body: uploadFormData,
    });
    const { url } = await uploadRes.json();

    // Run the job with form data
    const runFormData = new FormData();
    runFormData.append('fileUrl', url);
    runFormData.append('gpu', 'A40');
    const jobRes = await fetch('https://ai-gpu-backend.fly.dev/run', {
      method: 'POST',
      body: runFormData,
    });
    const { jobId } = await jobRes.json();
    setJobId(jobId);
    setStatus('queued');
  };

  const checkStatus = useCallback(async () => {
    if (!jobId) return;
    const res = await fetch(`https://ai-gpu-backend.fly.dev/status/${jobId}`);
    const { status } = await res.json();
    setStatus(status);
  }, [jobId]); // jobId is the only dependency

  useEffect(() => {
    if (jobId) {
      const interval = setInterval(checkStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [jobId, checkStatus]);

  return (
    <div className="App">
      <h1>AI GPU Cloud - $1.25 CAD/hour (30-min minimum) + $0.50 CAD upload</h1>
      <p>Upload your script or model and run it instantly on our GPUs.</p>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleRun}>Run Now</button>
      {jobId && (
        <div>
          <p>Job ID: {jobId}</p>
          <p>Status: {status}</p>
          {status === 'done' && (
            <a href={`https://ai-gpu-backend.fly.dev/download/${jobId}`}>Download Results</a>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
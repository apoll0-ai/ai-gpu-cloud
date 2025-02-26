import React, { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('');

  const handleRun = async () => {
    if (!file) return alert('Please upload a file');
    const formData = new FormData();
    formData.append('file', file);
    const uploadRes = await fetch('https://your-fly-app.fly.dev/upload', {
      method: 'POST',
      body: formData,
    });
    const { url } = await uploadRes.json();
    const jobRes = await fetch('https://your-fly-app.fly.dev/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileUrl: url, gpu: 'A40' }),
    });
    const { jobId } = await jobRes.json();
    setJobId(jobId);
    setStatus('queued');
  };

  const checkStatus = async () => {
    if (!jobId) return;
    const res = await fetch(`https://your-fly-app.fly.dev/status/${jobId}`);
    const { status } = await res.json();
    setStatus(status);
  };

  React.useEffect(() => {
    if (jobId) {
      const interval = setInterval(checkStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [jobId]);

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
            <a href={`https://your-fly-app.fly.dev/download/${jobId}`}>Download Results</a>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
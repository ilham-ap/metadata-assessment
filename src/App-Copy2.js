import './App.css';
import React, { useEffect, useState } from 'react';
import { Container, Tabs, Tab } from 'react-bootstrap';
import SummaryChart from './components/SummaryChart';
import AssessmentSection from './components/AssessmentSection';
import CheckList from './components/CheckList';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [data, setData] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // -------------------
  // MAIN CHECK FUNCTION
  // -------------------
  function checkMetadata(md) {
    const result = {
      totalChecks: 0,
      totalScores: { Findable: 0, Accessible: 0, Interoperable: 0, Reusable: 0 },
      passed: 0,
      warnings: 0,
      failed: 0,
      informational: 0,
      passedScores: { Findable: 0, Accessible: 0, Interoperable: 0, Reusable: 0 },
      passedChecks: [],
      warningChecks: [],
      failedChecks: [],
      informationalCheck: [],
    };

    const addResult = (condition, successMsg, failureMsg, level = 'REQUIRED', principle = 'Findable') => {
      result.totalChecks++;
      result.totalScores[principle]++;
      if (condition) {
        result.passed++;
        result.passedScores[principle]++;
        result.passedChecks.push({ message: successMsg, level, principle });
      } else {
        if (level === 'REQUIRED') {
          result.failed++;
          result.failedChecks.push({ message: failureMsg, level, principle });
        } else {
          result.warnings++;
          result.warningChecks.push({ message: failureMsg, level, principle });
        }
      }
    };

    const addInfo = (infoMsg, level, principle) => {
      result.informational++;
      result.informationalCheck.push({ message: infoMsg, level, principle });
    };

    // === Basic FAIR Checks ===
    const titleCount = md.title?.split(/\s+/).filter(Boolean).length || 0;
    addResult(titleCount >= 4, `The title contains ${titleCount} words.`, `Title too short.`, 'REQUIRED', 'Findable');
    addResult(!!md.metadataIdentifier, `Identifier '${md.metadataIdentifier}' found.`, `No identifier found.`, 'REQUIRED', 'Findable');
    addInfo(`Resource type: ${md.resourceType || 'unknown'}`, 'INFO', 'Findable');

    return result;
  }

  // -------------------
  // FETCH HANDLER
  // -------------------
  const handleFetch = async (e) => {
  e.preventDefault();
  if (!url.trim()) {
    setError('Please enter a JSON URL'); 
    return;
  }
  setError('');
  setLoading(true);
  setData(null);

  try {
    const res = await fetch(url, {
      // helps some servers choose JSON renderer
      headers: { Accept: 'application/json, text/plain; q=0.9, */*; q=0.8' },
      // DO NOT set mode:'no-cors' (it makes the response opaque & unreadable)
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }

    // Decide how to parse based on content-type
    const ct = res.headers.get('content-type') || '';
    let raw;
    if (ct.includes('application/json') || ct.includes('+json')) {
      raw = await res.json();
    } else {
      // fallback: many servers send JSON as text/plain
      const txt = await res.text();

      // Try to find a JSON block if the page is an HTML “viewer”
      // Strip possible <pre>, <code>, or pretty-print wrappers
      const possibleJson = txt
        .replace(/^[\s\S]*?<pre[^>]*>/i, '')
        .replace(/<\/pre>[\s\S]*$/i, '')
        .trim();

      try {
        raw = JSON.parse(possibleJson);
      } catch {
        // last chance: attempt straight parse of the whole body (in case it was plain JSON)
        raw = JSON.parse(txt);
      }
    }

    const md = Array.isArray(raw) ? raw[0] : raw;
    setDataset(md);
    setData(checkMetadata(md));
  } catch (err) {
    // Likely causes: CORS blocked, HTML viewer page, or invalid JSON
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      setError('Browser blocked the request (network/CORS). See the “CORS options” below.');
    } else {
      setError(`Failed to load or parse JSON: ${err.message}`);
    }
  } finally {
    setLoading(false);
  }
};


  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return isNaN(date) ? 'Unknown' : date.getFullYear();
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">FAIR Metadata Assessment</h1>

      {/* Form Section */}
      <form onSubmit={handleFetch} className="flex gap-2 mb-4">
        <input
          type="url"
          placeholder="Enter JSON URL (e.g., https://domain.com/file.json)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-grow border border-gray-400 rounded p-2"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? 'Assessing...' : 'Assess'}
        </button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      {/* Result Section */}
      {!loading && data && dataset && (
        <>
          <p><strong>Author:</strong> {dataset.authors?.[0]?.name || 'Unknown'} ({formatDate(dataset.publicationDate)})</p>
          <p><strong>Dataset:</strong> {dataset.title || 'Untitled dataset'}</p>

          <div className="flex flex-col md:flex-row">
            <div className="mr-5 flex justify-center md:items-center text-center">
              <SummaryChart
                passed={data.passed}
                warnings={data.warnings}
                failed={data.failed}
                information={data.informational}
                total={data.totalChecks}
              />
            </div>

            <div className="w-full">
              {Object.entries(data.passedScores).map(([key, passvalue]) => {
                const total = data.totalScores[key] || 1;
                return (
                  <AssessmentSection
                    key={key}
                    title={key}
                    value={(passvalue / total) * 100}
                  />
                );
              })}
            </div>
          </div>

          <Tabs defaultActiveKey="passed" className="mt-4" fill>
            <Tab eventKey="passed" title={`✅ Passed (${data.passed})`}>
              <CheckList title="Passed Checks" items={data.passedChecks} color="#4CAF50" />
            </Tab>
            <Tab eventKey="failed" title={`❌ Failed (${data.failed})`}>
              <CheckList title="Failed Checks" items={data.failedChecks} color="#F44336" />
            </Tab>
            <Tab eventKey="warnings" title={`⚠️ Warnings (${data.warnings})`}>
              <CheckList title="Warnings" items={data.warningChecks} color="#FFC107" />
            </Tab>
            <Tab eventKey="info" title={`ℹ️ Info (${data.informational})`}>
              <CheckList title="Informational" items={data.informationalCheck} color="#2196F3" />
            </Tab>
          </Tabs>
        </>
      )}
    </Container>
  );
}

export default App;

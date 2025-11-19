import './App.css';
import React, { useEffect, useState } from 'react';
import { Container, Tabs, Tab } from 'react-bootstrap';
import SummaryChart from './components/SummaryChart';
import AssessmentSection from './components/AssessmentSection';
import CheckList from './components/CheckList';
import { motion, AnimatePresence } from 'framer-motion';
import { XMLParser } from 'fast-xml-parser';

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
  addResult(titleCount >= 4,
    `The title contains ${titleCount} words. Meets the minimum recommended value of 4.`,
    `The title contains ${titleCount} words. Minimum required is 7.`, 'REQUIRED', 'Findable');
    
  addResult(!!md.metadataIdentifier,
    `The metadata identifier '${md.metadataIdentifier}' was found.`,
    `No identifiers were found.`, 'REQUIRED', 'Findable');

  const author = md.authors || [];
  addResult(author.length > 0,
    `A resource author '${md.authors[0].name}' was found (first of 1 author name).`,
    `A resource author was missing.`, 'REQUIRED', 'Findable');
  
  addResult(author.length > 0,
    `The resource author identifier '${md.authors[0].orcid}' was found (first of 1 author identifier).`,
    `The resource author identifier was missing.`, 'REQUIRED', 'Findable');
  
  addResult(author.length > 0,
    `The resource author affiliation was found.`,
    `The resource author affiliation was missing.`, 'REQUIRED', 'Findable');

  addResult(!!md.publicationDate,
    `The resource publication date '${md.publicationDate}' was found`,
    `No resource publication date was found.`, 'REQUIRED', 'Findable');

  addResult(!!md.doi,
    `The digital object identifier '${md.doi}' was found.`,
    `No digital object identifier was found.`, 'REQUIRED', 'Findable');

  const shortCount = md.short_description?.split(/\s+/).filter(Boolean).length || 0;
  addResult(shortCount >= 20,
    `Short Description has ${shortCount} words. Meets the minimum recommended value of 20.`,
    `Short Description has ${shortCount} words. Minimum recommended is 20.`, 'REQUIRED', 'Findable');
    
  const docCount = md.documentation?.split(/\s+/).filter(Boolean).length || 0;
  addResult(docCount >= 100,
    `Documentation has ${docCount} words. Meets the minimum recommended value of 100.`,
    `Documentation has ${docCount} words. Minimum recommended is 100.`, 'REQUIRED', 'Findable');

  addResult(!!md.spatialExtent,
    `A spatial extent was found.`,
    `The spatial extent was missing.`, 'REQUIRED', 'Findable');

  addResult(!!md.corresponding_author,
    `The corresponding author '${md.authors[0].name} (${md.corresponding_author})' was found.`,
    `No corresponding author was found.`, 'REQUIRED', 'Accessible');

  addResult(!!md.doi,
    `The digital object identifier '${md.doi}' was found.`,
    `No digital object identifier was found.`, 'REQUIRED', 'Accessible');

  addResult(!!md.metadataIdentifier,
    `The metadata was publicly available.`,
    `No metadata was found.`, 'REQUIRED', 'Accessible');

  addResult(!!md.metadataIdentifier,
    `A resource landing page url 'https://taipidata.ncu.edu.tw/${md.metadataIdentifier}' was found.`,
    `No resource landing page url.`, 'REQUIRED', 'Accessible');
    
  addResult(!!md.metadataIdentifier,
    `A downloading url 'https://taipidata.ncu.edu.tw/${md.metadataIdentifier}.tar.gz' was found.`,
    `No downloading url was found.`, 'REQUIRED', 'Accessible');

  addResult(!!md.metadataCode,
    `Interactive map 'https://taipidata.ncu.edu.tw/map?id=${md.metadataIdentifier}' was found.`,
    `Interactive map was found.`, 'OPTIONAL', 'Accessible');

  addResult(!!md.metadataCode,
    `TaipiHUB 'https://taipidata.ncu.edu.tw/map?id=${md.metadataIdentifier}' was found.`,
    `No TaipiHUB was found.`, 'OPTIONAL', 'Accessible');

  addResult(!!md.metadataIdentifier,
    `API 'https://taipidata.ncu.edu.tw/generate-api?id=${md.metadataIdentifier}' was found.`,
    `No API was found.`, 'REQUIRED', 'Accessible');

  addResult(docCount >= 100,
    `Documentation has ${docCount} words. Meets the minimum recommended value of 100.`,
    `Documentation has ${docCount} words. Minimum recommended is 100.`, 'REQUIRED', 'Interoperable');
    
  addResult(!!md.metadataCode,
    `TaipiHUB 'https://taipidata.ncu.edu.tw/map?id=${md.metadataIdentifier}' was found.`,
    `No TaipiHUB was found.`, 'OPTIONAL', 'Interoperable');


   addResult(!!md.metadataIdentifier,
    `API 'https://taipidata.ncu.edu.tw/generate-api?id=${md.metadataIdentifier}' was found.`,
    `No API was found.`, 'REQUIRED', 'Interoperable');
 
  addResult(!!md.license,
    `The resource license was found.`,
    `No resource license was found.`, 'REQUIRED', 'Reusable');


  addInfo(`The resource type is: ${md.resourceType || 'dataset'}`,'INFO','Findable');


  return result;
}

  // -------------------
  // FETCH HANDLER
  // -------------------
  const handleFetch = async (e) => {
  e.preventDefault();

  if (!url.trim()) {
    setError('Please enter a JSON or XML URL');
    return;
  }

  setError('');
  setLoading(true);
  setData(null);

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json, application/xml, text/xml, text/plain; q=0.9, */*; q=0.8',
      },
      // DO NOT set mode: 'no-cors'
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }

    const ct = (res.headers.get('content-type') || '').toLowerCase();
    let raw;

    if (ct.includes('application/json') || ct.includes('+json')) {
      // JSON path
      raw = await res.json();
      console.log(JSON.stringify(raw, null, 2));

    } else if (ct.includes('xml') || /\.xml(\?|$)/i.test(url)) {
      // XML path
      const text = await res.text();

      // 1) Validate XML
      const xmlDoc = new DOMParser().parseFromString(text, 'application/xml');
      const parserError = xmlDoc.getElementsByTagName('parsererror')[0];
      if (parserError) throw new Error('Invalid XML');

      // 2) Convert XML → JSON
      const fxp = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
      });
      let jsonObj = fxp.parse(text);
delete jsonObj["?xml"]; // remove XML declaration if present
if (jsonObj.dataset && jsonObj.dataset.authors) {
  jsonObj.dataset.authors = jsonObj.dataset.authors.author;
}
raw = jsonObj.dataset;
console.log(JSON.stringify(raw, null, 2));

    } else {
      // Fallback: sometimes JSON is sent as text/plain or inside <pre>
      const txt = await res.text();
      const possibleJson = txt
        .replace(/^[\s\S]*?<pre[^>]*>/i, '')
        .replace(/<\/pre>[\s\S]*$/i, '')
        .trim();

      try {
        raw = JSON.parse(possibleJson);
      } catch {
        raw = JSON.parse(txt);
      }
    }

    const md = Array.isArray(raw) ? raw[0] : raw;
    setDataset(md);
    setData(checkMetadata(md));

  } catch (err) {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      setError('Browser blocked the request (network/CORS).');
    } else {
      setError(`Failed to load or parse data: ${err.message}`);
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
      <h1 className="mb-4">TaiPI Metadata Assessment</h1>

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
      {!loading && data && dataset && (() => {
  const authorsText = dataset.authors?.map(author => author.name).join(', ') || 'Unknown';

  return (
    <>
      <p><strong>Dataset Title:</strong> {dataset.title || 'Untitled dataset'}</p>
      <p><strong>Authors:</strong> {authorsText}</p>
      <p><strong>Year:</strong> {formatDate(dataset.publicationDate)}</p>
      

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
  );
})()}

    </Container>
  );
}

export default App;

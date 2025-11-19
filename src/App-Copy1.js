import './App.css';
import React, { useEffect, useState, useRef } from 'react';
import { Container, Tabs, Tab } from 'react-bootstrap';
import SummaryChart from './components/SummaryChart';
import AssessmentSection from './components/AssessmentSection';
import CheckList from './components/CheckList';
import metadata from './data/dummy-metadata.json';
import { motion, AnimatePresence } from 'framer-motion';

function App() {

function checkMetadata(md) {
  const result = {
    totalChecks: 0,
    totalScores: {
      Findable: 0,
      Accessible: 0,
      Interoperable: 0,
      Reusable: 0
    },
    passed: 0,
    warnings: 0,
    failed: 0,
    informational: 0,
    passedScores: {
      Findable: 0,
      Accessible: 0,
      Interoperable: 0,
      Reusable: 0
    },
    passedChecks: [],
    warningChecks: [],
    failedChecks: [],
    informationalCheck: []
  };

  // Helper function
  const addResult = (condition, successMsg, failureMsg, level = 'REQUIRED', principle = 'Findable') => {
    result.totalChecks++;
    result.totalScores[principle]++;

    const scoreMap = {
      REQUIRED: 10,
      OPTIONAL: 5
    };

    if (condition) {
      result.passed++;
      result.passedScores[principle]++;
      result.passedChecks.push({
      message: successMsg,
      level,
      principle
    });
    } else {
      if (level === 'REQUIRED') {
        result.failed++;
        result.failedChecks.push({
      message: failureMsg,
      level,
      principle
    });
      } else if (level === 'OPTIONAL') {
        result.warnings++;
        result.warningChecks.push({
      message: failureMsg,
      level,
      principle
    });
      }
    }
  };

  const addInfo = (infoMsg, level, principle) => {
    result.informational++;
    result.informationalCheck.push({
      message: infoMsg,
      level,
      principle
    });
  };

  // === Checks Start ===
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

  addResult(!!md.corresponding_author,
    `The coresponding author '${md.corresponding_author}' was found.`,
    `No corresponding author was found.`, 'REQUIRED', 'Accessible');

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
 
  addResult(!!md.license,
    `The resource license was found.`,
    `No resource license was found.`, 'REQUIRED', 'Reusable');

  addResult(!!md.spatialExtent,
    `A spatial extent was found.`,
    `The spatial extent was missing.`, 'REQUIRED', 'Findable');

  const docCount = md.documentation?.split(/\s+/).filter(Boolean).length || 0;
  addResult(docCount >= 100,
    `Abstract has ${docCount} words. Meets the minimum recommended value of 100.`,
    `Abstract has ${docCount} words. Minimum recommended is 100.`, 'REQUIRED', 'Findable');

  addResult(docCount >= 100,
    `Documentation has ${docCount} words. Meets the minimum recommended value of 100.`,
    `Documentation has ${docCount} words. Minimum recommended is 100.`, 'REQUIRED', 'Interoperable');
    
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
    `Interactive map 'https://taipidata.ncu.edu.tw/map?id=${md.metadataCode}' was found.`,
    `Interactive map was found.`, 'OPTIONAL', 'Accessible');

  addResult(!!md.metadataCode,
    `TaipiHUB 'https://taipidata.ncu.edu.tw/map?id=${md.metadataCode}' was found.`,
    `No TaipiHUB was found.`, 'OPTIONAL', 'Accessible');

  addResult(!!md.metadataCode,
    `TaipiHUB 'https://taipidata.ncu.edu.tw/map?id=${md.metadataCode}' was found.`,
    `No TaipiHUB was found.`, 'OPTIONAL', 'Interoperable');

  addResult(!!md.metadataIdentifier,
    `API 'https://taipidata.ncu.edu.tw/generate-api?id=${md.metadataIdentifier}' was found.`,
    `No API was found.`, 'REQUIRED', 'Accessible');

   addResult(!!md.metadataIdentifier,
    `API 'https://taipidata.ncu.edu.tw/generate-api?id=${md.metadataIdentifier}' was found.`,
    `No API was found.`, 'REQUIRED', 'Interoperable');




  addInfo(`The resource type is: ${md.resourceType || 'unknown'}`,'INFO','Findable');


  return result;
}
    

const [data, setData] = useState(null);
const [dataset, setDataset] = useState(null);
const [isOpen, setIsOpen] = useState(false);

useEffect(() => {

  fetch(`https://taipidata.ncu.edu.tw/assessment/11405141`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data1 => {setData(checkMetadata(data1[0]));
                   setDataset(data1[0])
                   }
         );

}, []);

    if (!data) {
    return <div></div>;
  }

const formatDate = (isoString) => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  return `${year}`;
};

    
  return (

      <>

     <AnimatePresence>
  {isOpen && (
      <div className="flex justify-center ">
    <motion.div
      initial={{ y: -200, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -200, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="fixed top-6 w-full max-w-md p-6  bg-white border border-gray-500 shadow-xl rounded-xl z-50"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Top Popup</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
      </div>
    <div className="w-full border-b border-gray-300"></div>
      <p className="mt-4 text-gray-700">
        This popup slides from the top and disappears smoothly.
      </p>
    </motion.div>
 </div> )}
</AnimatePresence>

      
    <Container className="mt-4">
     
     

      
      <h1>Metadata Assessment Report</h1>
             <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-blue-600 text-white rounded shadow"
      >
        Toggle Popup
      </button>
      <p><strong>Author:</strong> {dataset.authors[0].name} ({formatDate(dataset.publicationDate)})</p>
      <p><strong>Dataset:</strong> {dataset.title}  </p>
 <div className="flex flex-col md:flex-row ">
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
    const value = data.totalScores[key] || 1; // Avoid division by 0
    return (
      <AssessmentSection
        key={key}
        title={key}
        value={(passvalue / value) * 100}
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
          <CheckList title="Warning Checks" items={data.warningChecks} color="#FFC107" />
        </Tab>
        
        <Tab eventKey="info" title={`ℹ️ Info (${data.informational})`}>
          <CheckList title="Informational" items={data.informationalCheck} color="#2196F3" />
        </Tab>
      </Tabs>
    </Container>
    
 
</>
  );
}

export default App;

import React, { useState } from 'react';
import { XMLParser } from 'fast-xml-parser';

export default function App() {
  const [xmlInput, setXmlInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState(null);

  const handleConvert = () => {
    try {
      const parser = new XMLParser();
      const jsonObj = parser.parse(xmlInput);
      delete jsonObj["?xml"];
      setJsonOutput(jsonObj);
    } catch (error) {
      console.error('Error parsing XML:', error);
      alert('Invalid XML format');
    }
  };


  return (
    <div className="p-4">
      <h2>XML to JSON Converter</h2>
      <textarea
        rows="8"
        value={xmlInput}
        onChange={(e) => setXmlInput(e.target.value)}
        placeholder="<note><to>User</to><from>ChatGPT</from></note>"
        className="w-full border p-2"
      />
      <button onClick={handleConvert} className="bg-blue-500 text-white px-4 py-2 mt-2 rounded">
        Convert
      </button>
      {jsonOutput && (
        <pre className="mt-4 bg-gray-100 p-3 rounded">
          {JSON.stringify(jsonOutput, null, 2)}
        </pre>
      )}
    </div>
  );
}

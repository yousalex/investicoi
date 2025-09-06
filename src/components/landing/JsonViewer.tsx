import React from 'react';

const JsonViewer = ({ data }: { data: Record<string, unknown> }) => {
  const renderJson = (jsonData: Record<string, unknown>): React.ReactNode => {
    if (typeof jsonData === 'string') {
      // Detectar URLs y hacerlas clicables
      const urlRegex = /^(https?:\/\/[^\s]+)$/;
      if (urlRegex.test(jsonData)) {
        return (
          <a
            href={jsonData}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {jsonData}
          </a>
        );
      }

      try {
        const parsed = JSON.parse(jsonData);
        return renderJson(parsed);
      } catch (e) {
        return <div className="whitespace-pre-wrap">{jsonData}</div>;
      }
    }

    if (Array.isArray(jsonData)) {
      return (
        <div className="pl-4 border-l border-gray-300 space-y-1">
          {jsonData.map((item, index) => (
            <div key={index} className="flex">
              <span className="text-gray-500 mr-2">{index}:</span>
              {renderJson(item)}
            </div>
          ))}
        </div>
      );
    }

    if (typeof jsonData === 'object' && jsonData !== null) {
      return (
        <div className="pl-4 border-l border-gray-300 space-y-1">
          {Object.entries(jsonData).map(([key, value]) => (
            <div key={key} className="flex">
              <span className="text-blue-500 mr-2">{key}:</span>
              {renderJson(value)}
            </div>
          ))}
        </div>
      );
    }

    return <div className="whitespace-pre-wrap">{String(jsonData)}</div>;
  };

  return <div>{renderJson(data)}</div>;
};

export default JsonViewer;

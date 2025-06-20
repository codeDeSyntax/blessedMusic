import React from "react";
import { Library } from "lucide-react";

const LibraryPanel: React.FC = () => {
  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Library size={20} className="mr-2" />
        <h2 className="text-lg font-semibold">Bible Library</h2>
      </div>
      <div className="text-center py-8 text-gray-500">
        <p>Library feature coming soon...</p>
      </div>
    </div>
  );
};

export default LibraryPanel;

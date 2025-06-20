import React from "react";
import { Clock } from "lucide-react";

const HistoryPanel: React.FC = () => {
  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Clock size={20} className="mr-2" />
        <h2 className="text-lg font-semibold">Reading History</h2>
      </div>
      <div className="text-center py-8 text-gray-500">
        <p>History feature coming soon...</p>
      </div>
    </div>
  );
};

export default HistoryPanel;

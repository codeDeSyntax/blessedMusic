import React from "react";
import { Settings } from "lucide-react";

const SettingsPanel: React.FC = () => {
  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Settings size={20} className="mr-2" />
        <h2 className="text-lg font-semibold">Bible Settings</h2>
      </div>
      <div className="text-center py-8 text-gray-500">
        <p>Settings feature coming soon...</p>
      </div>
    </div>
  );
};

export default SettingsPanel;

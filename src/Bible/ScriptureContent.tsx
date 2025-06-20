import React from "react";
import { Book } from "lucide-react";

const ScriptureContent: React.FC = () => {
  return (
    <div className="flex-1 p-8 flex items-center justify-center">
      <div className="text-center">
        <Book size={48} className="mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">
          Scripture Content
        </h2>
        <p className="text-gray-500">
          Bible content feature is being migrated to Redux...
        </p>
      </div>
    </div>
  );
};

export default ScriptureContent;

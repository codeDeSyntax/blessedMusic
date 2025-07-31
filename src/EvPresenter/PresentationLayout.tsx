// components/PresentationLayout.tsx

import React from "react";

type PresentationLayoutProps = {
  children: React.ReactNode;
  title?: string; // Keep for compatibility but not used
  hasBackButton?: boolean; // Keep for compatibility but not used
  onBackClick?: () => void; // Keep for compatibility but not used
};

export const PresentationLayout: React.FC<PresentationLayoutProps> = ({
  children,
}) => {
  return (
    <div className="h-full bg-[#282828] text-white overflow-hidden">
      {/* Main Content - Full height */}
      {children}
    </div>
  );
};

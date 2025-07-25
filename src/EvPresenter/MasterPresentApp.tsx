// pages/PresentationMaster.tsx

import React, { useEffect, useState } from "react";
import { PresentationLayout } from "./PresentationLayout";
import { PresentationList } from "./PList";
import { SermonForm } from "./PresentationForm";
import { PresentationSlideshowRefactored } from "./PresentationSlideshowRefactoredNew";
import { Presentation } from "@/types";
import { PresentationDetail } from "./PresentationDetail";
import { useAppDispatch, useAppSelector } from "@/store";
import { setCurrentScreen } from "@/store/slices/appSlice";
import { usePresenterOperations } from "@/features/presenter/hooks/usePresenterOperations";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";

type ViewState =
  | { type: "list"; category: "sermon" }
  | { type: "detail"; presentation: Presentation }
  | { type: "edit"; presentation: Presentation }
  | { type: "create"; category: "sermon" }
  | { type: "mpresenter"; presentation: Presentation };

const PresentationMasterPage: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>({
    type: "list",
    category: "sermon",
  });
  const [selectedCategory, setSelectedCategory] = useState<"sermon">("sermon");
  const dispatch = useAppDispatch();
  const { currentPresentation, selectPresentation } = usePresenterOperations();

  // Set currentScreen to mpresenter when component mounts and when in presentation mode
  useEffect(() => {
    dispatch(setCurrentScreen("mpresenter"));
  }, [dispatch]);

  // Ensure currentScreen stays as mpresenter when in presentation mode
  useEffect(() => {
    if (viewState.type === "mpresenter") {
      dispatch(setCurrentScreen("mpresenter"));
    }
  }, [viewState.type, dispatch]);

  // Handle back navigation based on current view state
  const handleBack = () => {
    switch (viewState.type) {
      case "list":
        // Only go back to Bible when we're at the root list view
        dispatch(setCurrentScreen("bible"));
        break;
      case "detail":
        setViewState({ type: "list", category: viewState.presentation.type });
        break;
      case "edit":
        setViewState({ type: "detail", presentation: viewState.presentation });
        break;
      case "create":
        setViewState({ type: "list", category: viewState.category });
        break;
      case "mpresenter":
        setViewState({ type: "list", category: selectedCategory });
        break;
    }
  };

  const renderContent = () => {
    switch (viewState.type) {
      case "list":
        return (
          <PresentationList
            type={viewState.category}
            onBack={() =>
              setViewState({ type: "list", category: selectedCategory })
            }
            onSelect={(presentation) =>
              setViewState({ type: "detail", presentation })
            }
            onPresent={(presentation) => {
              setViewState({ type: "mpresenter", presentation });
              selectPresentation(presentation);
            }}
            onEdit={(presentation) =>
              setViewState({ type: "edit", presentation })
            }
            onNew={() =>
              setViewState({ type: "create", category: viewState.category })
            }
            onCategoryChange={(category) => {
              // Only allow "sermon" category now
              if (category === "sermon") {
                setSelectedCategory(category);
                setViewState({ type: "list", category });
              }
            }}
          />
        );

      case "detail":
        return (
          <PresentationDetail
            presentation={viewState.presentation}
            onBack={() =>
              setViewState({
                type: "list",
                category: viewState.presentation.type,
              })
            }
            onPresent={(presentation) => {
              setViewState({ type: "mpresenter", presentation });
              selectPresentation(presentation);
            }}
            onEdit={() =>
              setViewState({
                type: "edit",
                presentation: viewState.presentation,
              })
            }
          />
        );

      case "edit":
        return (
          <SermonForm
            initialData={viewState.presentation}
            onSave={() =>
              setViewState({
                type: "list",
                category: viewState.presentation.type,
              })
            }
            onCancel={() =>
              setViewState({
                type: "detail",
                presentation: viewState.presentation,
              })
            }
          />
        );

      case "create":
        return (
          <SermonForm
            onSave={() =>
              setViewState({ type: "list", category: viewState.category })
            }
            onCancel={() =>
              setViewState({ type: "list", category: viewState.category })
            }
          />
        );

      case "mpresenter":
        return (
          <PresentationSlideshowRefactored
            onBack={() =>
              setViewState({ type: "list", category: selectedCategory })
            }
          />
        );
    }
  };

  const getTitle = () => {
    switch (viewState.type) {
      case "list":
        return "Sermons";
      case "detail":
        return viewState.presentation.title;
      case "edit":
        return `Edit: ${viewState.presentation.title}`;
      case "create":
        return `New ${
          viewState.category === "sermon" ? "Sermon" : "Presentation"
        }`;
      case "mpresenter":
        return "Presentation";
    }
  };

  return (
    <PresentationLayout title={getTitle()} onBackClick={handleBack}>
      <div className="overflow-hidden h-full bg-[#30261d]">
        {renderContent()}
      </div>
    </PresentationLayout>
  );
};

export default PresentationMasterPage;

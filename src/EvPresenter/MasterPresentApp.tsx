// pages/PresentationMaster.tsx

import React, { useEffect, useState } from "react";
import { PresentationLayout } from "./PresentationLayout";
import { CategorySelection } from "./CategoryScreen";
import { PresentationList } from "./PList";
import { SermonForm, OtherForm } from "./PresentationForm";
import { PresentationSlideshow } from "./PresentationSlideShow";
import { Presentation } from "@/types";
import { PresentationDetail } from "./PresentationDetail";
import { useAppDispatch, useAppSelector } from "@/store";
import { setCurrentScreen } from "@/store/slices/appSlice";
import { usePresenterOperations } from "@/features/presenter/hooks/usePresenterOperations";
import { useBibleOperations } from "@/features/bible/hooks/useBibleOperations";


type ViewState =
  | { type: "categories" }
  | { type: "list"; category: "sermon" | "other" }
  | { type: "detail"; presentation: Presentation }
  | { type: "edit"; presentation: Presentation }
  | { type: "create"; category: "sermon" | "other" }
  | { type: "mpresenter",presentation:Presentation};

const PresentationMasterPage: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>({ type: "categories" });
  const dispatch = useAppDispatch();
  const { currentPresentation, selectPresentation } = usePresenterOperations();

  //listen for escape key


  const renderContent = () => {
    switch (viewState.type) {
      case "categories":
        return (
          <CategorySelection
            onCategorySelect={(category) =>
              setViewState({ type: "list", category })
            }
          />
        );

      case "list":
        return (
          <PresentationList
            type={viewState.category}
            onBack={() => setViewState({ type: "categories" })}
            onSelect={(presentation) =>
              setViewState({ type: "detail", presentation })
            }
            onPresent={(presentation) => {
              setViewState({type:"mpresenter", presentation});
              selectPresentation(presentation)
            }}
            onEdit={(presentation) =>
              setViewState({ type: "edit", presentation })
            }
            onNew={() =>
              setViewState({ type: "create", category: viewState.category })
            }
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
              setViewState({type:"mpresenter", presentation});
              selectPresentation(presentation)
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
        return viewState.presentation.type === "sermon" ? (
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
        ) : (
          <OtherForm
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
        return viewState.category === "sermon" ? (
          <SermonForm
            onSave={() =>
              setViewState({
                type: "list",
                category: viewState.category,
              })
            }
            onCancel={() =>
              setViewState({
                type: "list",
                category: viewState.category,
              })
            }
          />
        ) : (
          <OtherForm
            onSave={() =>
              setViewState({
                type: "list",
                category: viewState.category,
              })
            }
            onCancel={() =>
              setViewState({
                type: "list",
                category: viewState.category,
              })
            }
          />
        );

        case "mpresenter":
          return <PresentationSlideshow
          onBack={() =>
            setViewState({
              type: "categories",
            })
          }
         
          />

    }
  };

  const getTitle = () => {
    switch (viewState.type) {
      case "categories":
        return "Presentation Master";
      case "list":
        return viewState.category === "sermon"
          ? "Sermons"
          : "Other Presentations";
      case "detail":
        return viewState.presentation.title;
      case "edit":
        return `Edit: ${viewState.presentation.title}`;
      case "create":
        return `New ${
          viewState.category === "sermon" ? "Sermon" : "Presentation"
        }`;
    }
  };

  const hasBackButton = viewState.type !== "categories";

  const handleBackClick = () => {
    switch (viewState.type) {
      case "list":
        setViewState({ type: "categories" });
        break;
      case "detail":
        setViewState({
          type: "list",
          category: viewState.presentation.type,
        });
        break;
      case "edit":
        setViewState({
          type: "detail",
          presentation: viewState.presentation,
        });
        break;
      case "create":
        setViewState({
          type: "list",
          category: viewState.category,
        });
        break;
    }
  };

  return (
    <>
      <PresentationLayout
        title={getTitle() || ""}
        hasBackButton={hasBackButton}
        onBackClick={handleBackClick}
      >
        {renderContent()}
      </PresentationLayout>
      {/* <PresentationSlideshow /> */}
    </>
  );
};

export default PresentationMasterPage;

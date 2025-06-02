import React from "react";
import { RefreshCcw } from "lucide-react";

interface LoadingErrorProps {
  fetching: boolean;
  fetchError: string | null;
  songsLength: number;
}

const LoadingError = React.memo(
  ({ fetching, fetchError, songsLength }: LoadingErrorProps) => {
    if (fetching) {
      return (
        <div className="flex flex-col justify-start items-center h-96 w-full">
          <RefreshCcw className="w-10 h-10 text-[#9a674a] text-center animate-spin" />
          <p className="mt-2 text-[14px] text-stone-500 font-medium">
            fetching..
          </p>
        </div>
      );
    }

    if (songsLength === 0 && fetchError) {
      return (
        <div className="font-thin flex flex-col justify-start items-center text-[#9a674a] text-center absolute top-[30%] left-1/2 transform -translate-x-1/2">
          {fetchError}
          <img src="./look.svg" alt="lookerror" className="size-20" />
        </div>
      );
    }

    return null;
  }
);

LoadingError.displayName = "LoadingError";

export default LoadingError;

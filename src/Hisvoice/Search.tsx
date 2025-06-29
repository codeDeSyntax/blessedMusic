import { useContext, useState } from "react";
import { Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { ChevronDown, ChevronUp } from "lucide-react";
import earlySermons from "../sermons/1964-1969/firstset.js";
import secondSet from "../sermons/1970/1970";
import thirdSet from "../sermons/1971/1971";
import fourthSet from "../sermons/1972/1972";
import lastSet from "../sermons/1973/1973";
import { useSermonContext } from "@/Provider/Vsermons";
import { useTheme } from "@/Provider/Theme.js";

const Search = () => {
  const { setActiveTab, setSelectedMessage, setRecentSermons, setSearchQuery } =
    useSermonContext();
    const {isDarkMode} = useTheme();
  const [rightSearchText, setRightSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<
    {
      id: string | number;
      title: string;
      year?: string;
      location?: string;
      shortSentence: string;
      fullContext: {
        pre: string;
        match: string;
        post: string;
      };
      sermon: string;
      type?: string;
    }[]
  >([]);
  const [expandedResults, setExpandedResults] = useState<{
    [key: string]: boolean | undefined;
  }>({});

  const sermonCollection = [
    ...earlySermons,
    ...secondSet,
    ...thirdSet,
    ...fourthSet,
    ...lastSet,
  ];

  const handleRightSearch = () => {
    const filtered = sermonCollection
      .map((sermon) => {
        const regex = new RegExp(`(${rightSearchText})`, "i");
        const match = sermon.sermon.match(regex);

        if (match) {
          // Get more context for the match
          const preContext =
            match && match.index !== undefined
              ? sermon.sermon.slice(Math.max(0, match.index - 200), match.index)
              : "";
          const postContext = sermon.sermon.slice(
            match && match.index !== undefined
              ? match.index + match[0].length
              : 0,
            match && match.index !== undefined
              ? match.index + match[0].length + 200
              : 200
          );
          let shortSentence = "";
          if (match && match.index !== undefined) {
            shortSentence = sermon.sermon.slice(
              Math.max(0, match.index - 30),
              match.index + match[0].length + 30
            );
          }

          return {
            id: sermon.id,
            title: sermon.title,
            year: sermon.year,
            location: sermon.location,
            shortSentence: shortSentence.replace(
              regex,
              `<highlight class='highlight'>${match[0]}</highlight>`
            ),
            fullContext: {
              pre: preContext,
              match: match[0],
              post: postContext,
            },
            sermon: sermon.sermon,
            type: sermon.type,
          };
        }
        return null;
      })
      .filter(Boolean);

    setSearchResults(filtered.filter((result) => result !== null));
    setExpandedResults({});
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    handleRightSearch();
  };

  const handleSearchResultClick = (result: {
    id: string | number;
    title: string;
    year?: string;
    location?: string;
    shortSentence: string;
    fullContext: {
      pre: string;
      match: string;
      post: string;
    };
    sermon: string;
    type?: string;
  }) => {
    const sermon = sermonCollection.find((s) => s.id === result.id);
    if (sermon) {
      setSelectedMessage(sermon);
    }
    setActiveTab("message");
    setSearchQuery(rightSearchText);

    const recentSermons = JSON.parse(
      localStorage.getItem("recentSermons") || "[]"
    );
    const updatedRecentSermons = recentSermons.filter(
      (item: { id: string | number }) => sermon && item.id !== sermon.id
    );
    updatedRecentSermons.unshift(sermon);
    const limitedRecentSermons = updatedRecentSermons.slice(0, 15);
    localStorage.setItem("recentSermons", JSON.stringify(limitedRecentSermons));
    setRecentSermons(limitedRecentSermons);
  };

  const toggleExpanded = (
    resultId: string | number,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    setExpandedResults((prev) => ({
      ...prev,
      [resultId]: !prev[resultId],
    }));
  };

  return (
    <div
      className="w-1/2 bg-white dark:bg-ltgray  flex flex-col overflow-y-scroll no-scrollbar"
      style={{ height: "100vh" }}
    >
      <div className="sticky top-10  p-8 z-10  rounded-b-md pt-10 bg-white  dark:bg-ltgray">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search quotes within all sermons"
              className="flex-grow p-2 px-5 py-3 text-[12px] border-none   focus:border-b-2 focus:border-gray-500 focus:outline-none dark:text-gray-50 text-gray-500 placeholder-gray-500 bg-gray-50 dark:bg-ltgray rounded-full outline-none dark:placeholder-gray-50"
              onChange={(e) => setRightSearchText(e.target.value)}
              value={rightSearchText}
              style={{
                fontFamily: "cursive",
                borderWidth: 1,
                borderColor: isDarkMode ? "#202020" :"#20202020",
                borderStyle: "solid",
              }}
            />
            <button className="ml-2 p-2 px-3 py-3 dark:bg-[#434343] bg-gray-50 shadow  text-stone-500 dark:text-gray-50">
              Search
            </button>
          </div>
        </form>
      </div>
      <div className="flex-grow overflow-y-auto no-scrollbar p-4">
        {searchResults.length > 1 ? (
          searchResults.map((result, index) => (
            <div
              key={`${result.id}-${index}`}
              className="mb-4 p-3 bg-white shadow dark:shadow-bgray dark:bg-ltgray rounded-lg cursor-pointer hover:bg-opacity-20 transition-all "
              onClick={() => handleSearchResultClick(result)}
            >
              <h3 className="dark:text-stone-200 text-stone-500 font-bold mb-2 text-[14px] ">
                {result.title}
              </h3>
              <div className="relative">
                {expandedResults[result.id] ? (
                  <div className=" text-[12px]">
                    <span className=" text-stone-500 dark:text-gray-50 opacity-70">
                      {result.fullContext.pre}
                    </span>
                    <span className=" text-stone-500 dark:text-gray-50 highlight">
                      {result.fullContext.match}
                    </span>
                    <span className=" text-stone-500 dark:text-gray-50 opacity-70">
                      {result.fullContext.post}
                    </span>
                  </div>
                ) : (
                  <p
                    className="text-stone-500 opacity-70 dark:text-gray-50 text-[12px]"
                    dangerouslySetInnerHTML={{ __html: result.shortSentence }}
                  ></p>
                )}
                <button
                  className=" right-0 bottom-0 flex items-center bg-gray-50 dark:bg-[#434343] text-stone-500 shadow focus:outline-none dark:text-gray-50 hover:text-stone-700 transition-colors p-1 text-[12px] mt-2"
                  onClick={(e) => toggleExpanded(result.id, e)}
                >
                  {expandedResults[result.id] ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      Show More
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center flex-col">
            <img src="./nosong.png" alt="look" className="h-40 " />
            <p className="text-stone-500 dark:text-gray-50"></p>
            <p
              className="text-center font-sans text-sm italic text-stone-500 dark:text-gray-50 mb-4 mt-10"
              style={{ fontFamily: "cursive" }}
            >
              Search for quotes across all sermons preached by Robert Lambert
              Lee
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;

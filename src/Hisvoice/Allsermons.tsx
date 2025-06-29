import { useContext, useState, useMemo } from "react";
import { Tooltip, Space } from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  FontSizeOutlined,
} from "@ant-design/icons";
import { LetterTextIcon, Mic } from "lucide-react";
import Search from "./Search.js";
import { useSermonContext } from "@/Provider/Vsermons.js";
import { Sermon } from "@/types/index.js";
import { useTheme } from "@/Provider/Theme.js";

const SermonList = () => {
  const {
    allSermons,
    loading,
    error,
    setActiveTab,
    setSelectedMessage,
    setRecentSermons,
  } = useSermonContext();

  const [searchText, setSearchText] = useState("");
  const [sortKey, setSortKey] = useState("title");
  const [sortOrder, setSortOrder] = useState("ascend");
  const { isDarkMode } = useTheme();

  const filteredSermons = useMemo(() => {
    return allSermons.filter((sermon) =>
      sermon.title.toString().toLowerCase().includes(searchText.toLowerCase())
    );
  }, [allSermons, searchText]);

  const sortedSermons = useMemo(() => {
    return [...filteredSermons].sort((a, b) => {
      if (sortKey === "year") {
        const yearA = a.year;
        const yearB = b.year;
        return sortOrder === "ascend"
          ? Number(yearA) - Number(yearB)
          : Number(yearB) - Number(yearA);
      }
      return sortOrder === "ascend"
        ? (a[sortKey as keyof Sermon] as string).localeCompare(
            b[sortKey as keyof Sermon] as string
          )
        : (b[sortKey as keyof Sermon] as string).localeCompare(
            a[sortKey as keyof Sermon] as string
          );
    });
  }, [filteredSermons, sortKey, sortOrder]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSermonClick = (sermon: Sermon) => {
    setSelectedMessage(sermon);
    setActiveTab("message");

    const recentSermons = JSON.parse(
      localStorage.getItem("recentSermons") || "[]"
    );
    const updatedRecentSermons = recentSermons.filter(
      (item: Sermon) => item.id !== sermon.id
    );
    updatedRecentSermons.unshift(sermon);
    const limitedRecentSermons = updatedRecentSermons.slice(0, 15);
    localStorage.setItem("recentSermons", JSON.stringify(limitedRecentSermons));
    setRecentSermons(limitedRecentSermons);
  };

  const handleSort = (key: keyof Sermon) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "ascend" ? "descend" : "ascend");
    } else {
      setSortKey(key);
      setSortOrder("ascend");
    }
  };

  if (loading) return <div>Loading sermons...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div
      className="flex h-screen overflow-y-scroll no-scrollbar px-10  font-serif bg-contain bg-center bg-white  dark:bg-ltgray"
      // style={{
      //   backgroundImage: `
      //     linear-gradient(to top, rgba(250, 206, 137, 0.8) 0%, rgba(0, 0, 0, 0.8) 20%, rgba(0, 0, 0, 0.1) 100%),
      //     url('./cloud.png')
      //   `,
      // }}
    >
      {/* Left side - Sermon List */}

      <div
        className="w-1/2 overflow-y-auto no-scrollbar bg-white  dark:bg-ltgray "
        style={{ height: "100vh" }}
      >
        <div className="sticky   px-4 py-2 z-10 top-0 pt-10  rounded-b-md  bg-white  dark:bg-ltgray ">
          <h2 className="text-lg font-bold font-serif mb-2 text-stone-500 dark:text-gray-50">
            Sermon List
          </h2>
          <Space className="mb-4" direction="vertical" style={{ width: "90%" }}>
            <input
              placeholder="Search sermons"
              onChange={handleSearch}
              className="flex-grow p-1 text-[12px] bg-gray-50 dark:bg-ltgray py-3 px-3 border-none  rounded-md border-gray-300 focus:border-b-2 dark:text-white text-gray-800  placeholder-gray-500 placeholder:text-[12px] bg- outline-none"
              style={{ width: "100%" }}
              spellCheck={false}
              // prefix={<SearchOutlined className="text-gray-300" />}
            />
            <Space className="w-full bg-">
              <Tooltip title="Sort by Title">
                <button
                  onClick={() => handleSort("title")}
                  className={`p-2 rounded text-white ${
                    sortKey === "title"
                      ? "dark:bg-ltgray bg-ltgray"
                      : "bg-ltgray/30"
                  }`}
                >
                  <FontSizeOutlined />
                  {sortKey === "title" &&
                    (sortOrder === "ascend" ? (
                      <SortAscendingOutlined />
                    ) : (
                      <SortDescendingOutlined />
                    ))}
                </button>
              </Tooltip>
              <Tooltip title="Sort by Year">
                <button
                  onClick={() => handleSort("year")}
                  className={`p-2 rounded text-white ${
                    sortKey === "year"
                      ? "dark:bg-ltgray bg-ltgray"
                      : "bg-ltgray/30"
                  }`}
                >
                  <CalendarOutlined />
                  {sortKey === "year" &&
                    (sortOrder === "ascend" ? (
                      <SortAscendingOutlined />
                    ) : (
                      <SortDescendingOutlined />
                    ))}
                </button>
              </Tooltip>
              {/* <Tooltip title="Sort by Location">
                <button
                  onClick={() => handleSort("location")}
                  className={`p-2 rounded text-white ${
                    sortKey === "location" ? "bg-white bg-opacity-30" : ""
                  }`}
                >
                  <EnvironmentOutlined />
                  {sortKey === "location" &&
                    (sortOrder === "ascend" ? (
                      <SortAscendingOutlined />
                    ) : (
                      <SortDescendingOutlined />
                    ))}
                </button>
              </Tooltip> */}
            </Space>
          </Space>
        </div>
        <div className="px-4  scrollbar-hidden  flex flex-col items-center ">
          {sortedSermons.length === 0 && (
            <div className="flex items-center flex-col">
              <img src="./nosong.png" alt="look" className="h-40 " />
              <p className="">No sermons found</p>
            </div>
          )}
          {sortedSermons.map((sermon) => (
            <div
              key={sermon.id}
              className=" border-b border-gray-500  cursor-pointer px-2 mb-1 hover:bg-gray-50 dark:hover:bg-ltgray shaow dark:shadow-bgra group rounded-lg w-full"
              onClick={() => handleSermonClick(sermon)}
              style={{
                borderWidth: 1,
                borderColor: isDarkMode ? "#202020" : "#e0e0e0",
                borderStyle: "solid",
              }}
            >
              <p className=" text-[14px] font-bold font-serif pt-1 group-hover:underline text-stone-700 dark:text-gray-50 ">
                {sermon.title}
              </p>
              <div className="flex gap-3 text-gray-50 -mt-3">
                <p className="flex items-center  text-[12px] font-mono text-stone-700 dark:text-gray-50">
                  <CalendarOutlined className="mr-1 text-stone-700 dark:text-gray-50" />
                  {sermon.year}
                </p>
                <p
                  className={`flex items-center text-[12px] font-mono text-gray-50 `}
                >
                  <EnvironmentOutlined className="mr-1 text-stone-700 dark:text-gray-50" />{" "}
                  {!sermon.location && "N/A"}
                </p>
                <p className="flex items-center text-[12px]">
                  {sermon.type === "mp3" ? (
                    <Mic
                      size={12}
                      className="text-stone-700 dark:text-gray-500"
                    />
                  ) : (
                    <LetterTextIcon
                      size={12}
                      className="text-stone-700 dark:text-gray-50"
                    />
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side - Advanced Search */}
      <Search />
    </div>
  );
};

export default SermonList;

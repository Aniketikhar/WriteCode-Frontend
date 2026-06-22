import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ListCard from "../components/ListCard";
import GridCard from "../components/GridCard";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";

const Home = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [projTitle, setProjTitle] = useState("");
  const navigate = useNavigate();
  const [isCreateModelShow, setIsCreateModelShow] = useState(false);

  // Filter data based on search query
  const filteredData = data
    ? data.filter(
        (item) => item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const createProj = async () => {
    if (projTitle === "") {
      toast.error("Please enter a project title");
    } else {
      try {
        const res = await api.post("/api/projects/create", {
          title: projTitle,
        });
        const data = await res.json();
        if (data.success) {
          setIsCreateModelShow(false);
          setProjTitle("");
          toast.success("Project created successfully!");
          navigate(`/editor/${data.projectId}`);
        } else {
          toast.error("Something went wrong");
        }
      } catch {
        toast.error("Network error. Please try again.");
      }
    }
  };

  const getProj = async () => {
    try {
      const res = await api.post("/api/projects/all");
      const data = await res.json();
      if (data.success) {
        setData(data.projects);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Failed to load projects");
    }
  };

  useEffect(() => {
    getProj();
  }, []);

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.post("/api/auth/me");
        const data = await res.json();
        if (data.success) {
          setUserData(data.user);
        }
      } catch {
        // User details failed to load — non-critical
      }
    };
    fetchUser();
  }, []);

  const [isGridLayout, setIsGridLayout] = useState(false);

  return (
    <>
      <Navbar isGridLayout={isGridLayout} setIsGridLayout={setIsGridLayout} userData={userData} />
      <div className="flex flex-col md:flex-row items-center justify-between px-4 md:px-[100px] my-[20px] md:my-[40px] gap-4">
        <h2 className="text-lg md:text-2xl text-center md:text-left">
          Hi 👋, {userData ? userData.username : ""}
        </h2>
        <div className="flex flex-col-reverse sm:flex-row justify-center items-center gap-4 sm:gap-2 w-full md:w-auto">
          {/* Search Bar */}
          <div style={{marginBottom: "0px"}} className="inputBox w-full sm:w-[250px] md:w-[350px]">
            <input
              type="text"
              placeholder="Search Here...!"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2 py-1 border rounded-md text-sm"
            />
          </div>
          <div>
            <button
              onClick={() => {
                setIsCreateModelShow(true);
              }}
              className="btnBlue rounded-[5px]  text-sm md:text-[15px] py-2 px-4"
            >
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Project Display */}
      <div className="cards">
        {isGridLayout ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-4 md:px-[100px]">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <GridCard key={index} item={item} />
              ))
            ) : (
              <p>No projects found</p>
            )}
          </div>
        ) : (
          <div className="list px-4 md:px-[100px]">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <ListCard key={index} item={item} />
              ))
            ) : (
              <p>No projects found</p>
            )}
          </div>
        )}
      </div>

      {/* Modal for Creating a New Project */}
      {isCreateModelShow && (
        <div className="createModelCon fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-[rgb(0,0,0,0.1)] flex items-center justify-center">
          <div className="createModel w-[90vw] sm:w-[50vw] md:w-[30vw] h-auto shadow-lg shadow-black/50 bg-[#141414] rounded-[10px] p-[20px]">
            <h3 className="text-2xl">Create New Project</h3>
            <div className="inputBox !bg-[#202020] mt-4">
              <input
                onChange={(e) => {
                  setProjTitle(e.target.value);
                }}
                value={projTitle}
                type="text"
                placeholder="Project Title"
              />
            </div>
            <div className="flex items-center gap-[10px] w-full mt-2">
              <button
                onClick={createProj}
                className="btnBlue rounded-[5px] w-[49%] mb-4 !p-[5px] !px-[10px] !py-[10px]"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreateModelShow(false);
                }}
                className="btnBlue !bg-[#1A1919] rounded-[5px] mb-4 w-[49%] !p-[5px] !px-[10px] !py-[10px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;

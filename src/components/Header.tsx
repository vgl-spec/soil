import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/");
  };

  return (
    <>
      <div className="w-full bg-gradient-to-r from-[#8a9b6e] via-[#d4a762] to-[#6b8c85] shadow-md text-white">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4 py-2 sm:py-3 px-4 sm:px-6">
          <img src="/logo2.png" alt="QCU Logo" className="h-6 sm:h-10" />
          <img src="/logo3.png" alt="CWTS Logo" className="h-6 sm:h-10" />
          <img src="/logo5.png" alt="Group Logo" className="h-6 sm:h-10" />
          <img src="/logo4.png" alt="Talipapa Logo" className="h-6 sm:h-10" />
          <h1 className="text-lg sm:text-xl font-bold text-white ml-2 sm:ml-4">
            BRGY TALIPAPA URBAN FARM AND MRF INVENTORY
          </h1>
          <div className="ml-auto relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="bg-white text-green-800 px-2 sm:px-3 py-1 rounded hover:bg-green-100 text-sm sm:text-base"
            >
              Menu ▾
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white text-black rounded shadow-md z-50 text-sm sm:text-base">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;

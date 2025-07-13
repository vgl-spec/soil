import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // Get user data from localStorage for logging
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      if (user?.id) {
        // Call logout API to log the action
        const response = await fetch(`${API_BASE_URL}/logout.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id
          }),
        });

        const data = await response.json();
        if (!data.success) {
          console.warn('Logout logging failed:', data.message);
        }
      }
    } catch (error) {
      console.error('Error during logout logging:', error);
    } finally {
      // Always clear localStorage and navigate, even if API call fails
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      navigate("/");
    }
  };

  return (
    <>
      <div className="w-full bg-gradient-to-r from-[#8a9b6e] via-[#d4a762] to-[#6b8c85] shadow-md text-white">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4 py-2 sm:py-3 px-3 sm:px-6">
          {/* Mobile: Hide some logos, Desktop: Show all */}
          <div className="flex items-center gap-1 sm:gap-2">
            <img src="/logo2.png" alt="QCU Logo" className="h-6 sm:h-10" />
            <img src="/logo3.png" alt="CWTS Logo" className="h-6 sm:h-10 hidden sm:block" />
            <img src="/logo5.png" alt="Group Logo" className="h-6 sm:h-10" />
            <img src="/logo4.png" alt="Talipapa Logo" className="h-6 sm:h-10 hidden sm:block" />
          </div>
          
          {/* Mobile: Shorter title, Desktop: Full title */}
          <h1 className="text-xs sm:text-lg lg:text-xl font-bold text-white ml-2 sm:ml-4 flex-1 min-w-0">
            <span className="hidden sm:inline">BRGY TALIPAPA URBAN FARM AND MRF INVENTORY</span>
            <span className="sm:hidden">TALIPAPA FARM INVENTORY</span>
          </h1>
          
          <div className="ml-auto relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="bg-white text-green-800 px-2 sm:px-3 py-1 rounded hover:bg-green-100 text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Menu ▾</span>
              <span className="sm:hidden">☰</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-32 sm:w-48 bg-white text-black rounded shadow-md z-50">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-100 text-sm sm:text-base"
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
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { showToast } from "../utils/toastUtils";

interface HeaderProps {
  isSupervisor?: boolean;
  isOperator?: boolean;
  onMenuAction?: (action: 'addOperator' | 'deleteAccounts' | 'accounts' | 'analytics' | 'changePassword') => void;
}

const Header: React.FC<HeaderProps> = ({ isSupervisor = false, isOperator = false, onMenuAction }) => {
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
      showToast.success("Logged Out", "You have been successfully logged out");
      navigate("/");
    }
  };

  return (
    <>
      <div className="w-full bg-gradient-to-r from-[#8a9b6e] via-[#d4a762] to-[#6b8c85] shadow-md text-white">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4 py-2 sm:py-3 px-3 sm:px-6">
          {/* Always show all 4 logos */}
          <div className="flex items-center gap-1 sm:gap-2">
            <img src="/logo2.png" alt="QCU Logo" className="h-5 sm:h-8 lg:h-10" />
            <img src="/logo3.png" alt="CWTS Logo" className="h-5 sm:h-8 lg:h-10" />
            <img src="/logo5.png" alt="Group Logo" className="h-5 sm:h-8 lg:h-10" />
            <img src="/logo4.png" alt="Talipapa Logo" className="h-5 sm:h-8 lg:h-10" />
          </div>
          
          {/* Responsive title that adapts to available space */}
          <h1 className="text-xs sm:text-sm md:text-lg lg:text-xl font-bold text-white ml-1 sm:ml-2 lg:ml-4 flex-1 min-w-0 truncate">
            <span className="hidden md:inline">BRGY TALIPAPA URBAN FARM AND MRF INVENTORY</span>
            <span className="hidden sm:inline md:hidden">BRGY TALIPAPA FARM INVENTORY</span>
            <span className="sm:hidden">BRGY TALIPAPA INVENTORY</span>
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
              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white text-black rounded shadow-md z-50">
                {isSupervisor && (
                  <>
                    <button
                      onClick={() => {
                        onMenuAction?.('addOperator');
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-100 text-sm sm:text-base border-b border-gray-200"
                    >
                      Add New Operator
                    </button>
                  </>
                )}
                {(isSupervisor || isOperator) && (
                  <>
                    <button
                      onClick={() => {
                        onMenuAction?.('deleteAccounts');
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-100 text-sm sm:text-base border-b border-gray-200"
                    >
                      Delete Accounts
                    </button>
                    <button
                      onClick={() => {
                        onMenuAction?.('accounts');
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-100 text-sm sm:text-base border-b border-gray-200"
                    >
                      Account Details
                    </button>
                    <button
                      onClick={() => {
                        onMenuAction?.('analytics');
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-100 text-sm sm:text-base border-b border-gray-200"
                    >
                      Website Analytics
                    </button>
                    <button
                      onClick={() => {
                        onMenuAction?.('changePassword');
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-100 text-sm sm:text-base border-b border-gray-200"
                    >
                      Change Password
                    </button>
                  </>
                )}
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
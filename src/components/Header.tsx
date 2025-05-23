import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between p-1 sm:p-4 bg-gradient-to-r from-[#8a9b6e] via-[#d4a762] to-[#6b8c85] text-white shadow-md">
      <div className="flex items-center space-x-1 sm:space-x-2">
        <img
          src="/logo2.png"
          alt="Logo 1"
          className="h-4 sm:h-10"
        />
        <img
          src="/logo3.png"
          alt="Logo 2"
          className="h-4 sm:h-10"
        />
        <img
          src="/logo4.png"
          alt="Logo 3"
          className="h-4 sm:h-10"
        />
        <img
          src="/logo5.png"
          alt="Logo 4"
          className="h-4 sm:h-10"
        />
      </div>
      <h4 className="text-xs sm:text-2xl font-bold leading-tight text-center flex-1 mx-1">
        BRGY TALIPAPA URBAN FARM AND MRF INVENTORY
      </h4>
      <div>
        <button className="bg-white text-green-700 px-2 py-0.5 rounded text-xs sm:text-sm">
          Menu ▼
        </button>
      </div>
    </header>
  );
};

export default Header;

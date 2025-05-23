import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between p-1 sm:p-4 bg-green-700 text-white shadow-md">
      <Link to="/" className="flex items-center space-x-1 sm:space-x-2">
        <img
          src="/logo3.png"
          alt="Logo"
          className="h-5 sm:h-10"
          style={{ maxWidth: "100%" }}
        />
        <h1 className="text-sm sm:text-2xl font-bold leading-tight">
          Farm Inventory
        </h1>
      </Link>
    </header>
  );
};

export default Header;

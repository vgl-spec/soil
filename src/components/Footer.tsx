import React from "react";

const Footer: React.FC = () => (
  <footer className="bg-gradient-to-r from-[#8a9b6e] via-[#d4a762] to-[#6b8c85] text-white py-2 sm:py-3 mt-auto shadow-inner text-sm sm:text-base">
    <div className="text-center">
      © {new Date().getFullYear()} QCU Group 2 | Barangay Talipapa. All rights reserved.
    </div>
  </footer>
);

export default Footer;

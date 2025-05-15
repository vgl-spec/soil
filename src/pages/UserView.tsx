import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const UserView: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-gray-100">
    <Header />
    <main className="flex-1 p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold">Welcome, User!</h2>
      <p className="text-gray-700 mt-2">You have read-only access to the system.</p>
    </main>
    <Footer />
  </div>
);

export default UserView;
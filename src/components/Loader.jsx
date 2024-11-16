import React from 'react';
import logo from "../components/walk.gif"

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <img src={logo} alt="Loading..." className="w-16 h-16" />
    </div>
  );
};

export default Loader;

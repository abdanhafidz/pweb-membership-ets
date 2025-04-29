"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { 
  FaUser, 
  FaSignOutAlt, 
  FaUserEdit,
  FaChevronDown
} from "react-icons/fa";

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    Cookies.remove("jwt_token");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const goToProfile = () => {
    router.push("/profile");
    setDropdownOpen(false);
  };

  return (
    <header className="bg-black bg-opacity-80 p-4 shadow-md sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
          Member Dashboard
        </h1>
        
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition flex items-center gap-2"
          >
            <FaUser /> 
            <span>My Account</span>
            <FaChevronDown className={`transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-700">
              <button
                onClick={goToProfile}
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
              >
                <FaUserEdit />
                <span>Profile</span>
              </button>
              <div className="border-t border-gray-700"></div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { 
  FaUserEdit, 
  FaSignOutAlt, 
  FaSave, 
  FaArrowLeft
} from "react-icons/fa";

interface UserDetails {
  id: number;
  account_id: number;
  initial_name: string;
  full_name: string | null;
  address: string | null;
  gender: boolean;
  university: string | null;
  date_of_birth: string | null;
  place_of_birth: string | null;
  phone_number: string | null;
}

interface UserAccount {
  id: number;
  uuid: string;
  email: string;
  password: string;
  role: string;
  is_detail_completed: boolean;
  created_at: string;
  deleted_at: string | null;
}

interface User {
  account: UserAccount;
  details: UserDetails;
}

interface JwtPayload {
  exp: number;
  role: string;
  sub: string;
  user_id: number;
}

export default function UpdateProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    full_name: string;
    address: string;
    gender: boolean;
    university: string;
    date_of_birth: string;
    place_of_birth: string;
    phone_number: string;
  }>({
    full_name: "",
    address: "",
    gender: false, // default to male
    university: "",
    date_of_birth: "",
    place_of_birth: "",
    phone_number: "",
  });
  
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("jwt_token");
    if (!token) {
      toast.error("Please login to access your profile");
      router.push("/login");
      return;
    }

    fetchUserProfile();
  }, [router]);

  const fetchUserProfile = async () => {
    const token = Cookies.get("jwt_token");
    if (!token) return;

    try {
      const response = await fetch(
        "https://lifedebugger-pweb-api-ets.hf.space/api/v1/user/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expired. Please login again");
          Cookies.remove("jwt_token");
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      if (data.status === "success") {
        setUser(data.data);
        
        // Format date for input field (YYYY-MM-DD)
        let formattedDate = "";
        if (data.data.details.date_of_birth && 
            !data.data.details.date_of_birth.includes("0001-01-01")) {
          const date = new Date(data.data.details.date_of_birth);
          formattedDate = date.toISOString().split('T')[0];
        }
        
        setFormData({
          full_name: data.data.details.full_name || "",
          address: data.data.details.address || "",
          gender: data.data.details.gender,
          university: data.data.details.university || "",
          date_of_birth: formattedDate,
          place_of_birth: data.data.details.place_of_birth || "",
          phone_number: data.data.details.phone_number || "",
        });
      } else {
        toast.error(data.message || "Failed to fetch profile");
      }
    } catch (error) {
      toast.error("Error fetching profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else if (name === 'gender') {
      setFormData({
        ...formData,
        gender: value === 'true',
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = Cookies.get("jwt_token");
    if (!token) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        "https://lifedebugger-pweb-api-ets.hf.space/api/v1/user/me",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: formData.full_name || null,
            address: formData.address || null,
            gender: formData.gender,
            university: formData.university || null,
            date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth).toISOString() : null,
            place_of_birth: formData.place_of_birth || null,
            phone_number: formData.phone_number || null,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expired. Please login again");
          Cookies.remove("jwt_token");
          router.push("/login");
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const data = await response.json();
      if (data.status === "success") {
        toast.success("Profile updated successfully");
        // Refresh profile data
        fetchUserProfile();
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error updating profile");
      }
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    Cookies.remove("jwt_token");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white font-sans">
      <Toaster position="top-right" />
      
      <header className="bg-black bg-opacity-80 p-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
            Update Profile
          </h1>
          <div className="flex gap-3">
            <button
              onClick={goToDashboard}
              className="px-4 py-2 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-600 transition flex items-center gap-2"
            >
              <FaArrowLeft /> Back to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition flex items-center gap-2"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700 max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
              <FaUserEdit className="text-white text-2xl" />
            </div>
            <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Edit Your Profile
            </h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="initial_name" className="block text-sm font-medium text-gray-300">
                    Initial Name
                  </label>
                  <input
                    type="text"
                    id="initial_name"
                    value={user?.details.initial_name || ""}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-70"
                    disabled
                  />
                  <p className="text-xs text-gray-400">Initial name cannot be changed</p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user?.account.email || ""}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-70"
                    disabled
                  />
                  <p className="text-xs text-gray-400">Email cannot be changed</p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-300">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-300">
                    Gender
                  </label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="false"
                        checked={!formData.gender}
                        onChange={handleChange}
                        className="h-4 w-4 text-purple-500 focus:ring-purple-500 border-gray-500 bg-gray-700"
                      />
                      <span className="ml-2 text-gray-300">Male</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="true"
                        checked={formData.gender}
                        onChange={handleChange}
                        className="h-4 w-4 text-purple-500 focus:ring-purple-500 border-gray-500 bg-gray-700"
                      />
                      <span className="ml-2 text-gray-300">Female</span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-300">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="place_of_birth" className="block text-sm font-medium text-gray-300">
                    Place of Birth
                  </label>
                  <input
                    type="text"
                    id="place_of_birth"
                    name="place_of_birth"
                    value={formData.place_of_birth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your place of birth"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="university" className="block text-sm font-medium text-gray-300">
                    University
                  </label>
                  <input
                    type="text"
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your university"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-300">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your address"
                ></textarea>
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition flex items-center gap-2 disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <FaSave /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  );
}
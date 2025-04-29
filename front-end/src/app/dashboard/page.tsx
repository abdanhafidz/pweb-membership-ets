"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import Header from "@/components/Header"
import { 
  FaSearch, 
  FaTrash, 
  FaSignOutAlt, 
  FaSort, 
  FaSortUp, 
  FaSortDown,
  FaChevronLeft,
  FaChevronRight
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

type SortDirection = 'asc' | 'desc' | null;
type SortField = 'id' | 'email' | 'name' | 'dob' | 'created_at' | null;

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("jwt_token");
    if (!token) {
      toast.error("Please login to access the dashboard");
      router.push("/login");
      return;
    }

    // Decode JWT token to check user role
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      setIsAdmin(decoded.role === "admin");
    } catch (error) {
      console.error("Invalid token", error);
    }

    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    const token = Cookies.get("jwt_token");
    if (!token) return;

    try {
      const response = await fetch(
        "https://lifedebugger-pweb-api-ets.hf.space/api/v1/user/list",
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
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      if (data.status === "success") {
        setUsers(data.data);
      } else {
        toast.error(data.message || "Failed to fetch users");
      }
    } catch (error) {
      toast.error("Error fetching users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    const token = Cookies.get("jwt_token");
    if (!token) return;

    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    setDeleting(userId);
    try {
      const response = await fetch(
        `https://lifedebugger-pweb-api-ets.hf.space/api/v1/user/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          toast.error("You don't have permission to delete users");
          return;
        }
        throw new Error("Failed to delete user");
      }

      const data = await response.json();
      if (data.status === "success") {
        toast.success("User deleted successfully");
        // Update the users list
        setUsers(users.filter(user => user.account.id !== userId));
      } else {
        toast.error(data.message || "Failed to delete user");
      }
    } catch (error) {
      toast.error("Error deleting user");
      console.error(error);
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = () => {
    Cookies.remove("jwt_token");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString || dateString.includes("0001-01-01")) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    } catch (error) {
      return "N/A";
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <FaSort className="inline ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc' ? 
      <FaSortUp className="inline ml-1 text-purple-400" /> : 
      <FaSortDown className="inline ml-1 text-purple-400" />;
  };

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let result = [...users];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => {
        const email = user.account.email?.toLowerCase() || '';
        const name = user.details.full_name?.toLowerCase() || user.details.initial_name?.toLowerCase() || '';
        const phone = user.details.phone_number?.toLowerCase() || '';
        
        return email.includes(query) || 
               name.includes(query) || 
               phone.includes(query) ||
               String(user.account.id).includes(query);
      });
    }
    
    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let valueA, valueB;
        
        switch (sortField) {
          case 'id':
            valueA = a.account.id;
            valueB = b.account.id;
            break;
          case 'email':
            valueA = a.account.email || '';
            valueB = b.account.email || '';
            break;
          case 'name':
            valueA = a.details.full_name || a.details.initial_name || '';
            valueB = b.details.full_name || b.details.initial_name || '';
            break;
          case 'dob':
            valueA = a.details.date_of_birth || '';
            valueB = b.details.date_of_birth || '';
            break;
          case 'created_at':
            valueA = a.account.created_at || '';
            valueB = b.account.created_at || '';
            break;
          default:
            return 0;
        }
        
        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return result;
  }, [users, searchQuery, sortField, sortDirection]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white font-sans">
      <Toaster position="top-right" />
      <Header/>
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Member List
            </h2>
            
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-10 pr-4 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-700 bg-gray-800">
                  <thead className="bg-gray-700">
                    <tr>
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                        onClick={() => handleSort('id')}
                      >
                        ID {getSortIcon('id')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                        onClick={() => handleSort('email')}
                      >
                        Email {getSortIcon('email')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                        onClick={() => handleSort('name')}
                      >
                        Name {getSortIcon('name')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                        onClick={() => handleSort('dob')}
                      >
                        Date of Birth {getSortIcon('dob')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Phone
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                        onClick={() => handleSort('created_at')}
                      >
                        Created At {getSortIcon('created_at')}
                      </th>
                      {isAdmin && (
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700 bg-gray-800">
                    {currentItems.map((user) => (
                      <tr key={user.account.id} className="hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{user.account.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.account.email || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {user.details.full_name || user.details.initial_name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(user.details.date_of_birth)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {user.details.phone_number || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(user.account.created_at)}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            <button
                              onClick={() => handleDelete(user.account.id)}
                              disabled={deleting === user.account.id}
                              className="text-red-500 hover:text-red-400 transition-colors disabled:text-gray-500 p-2 rounded-full hover:bg-gray-600"
                              title="Delete user"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {currentItems.length === 0 && (
                      <tr>
                        <td colSpan={isAdmin ? 7 : 6} className="px-6 py-8 text-center text-gray-400 bg-gray-800">
                          {searchQuery ? "No results found for your search" : "No users found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                <div className="text-sm text-gray-400">
                  Showing <span className="font-medium text-white">{Math.min(filteredUsers.length, indexOfFirstItem + 1)}</span> to{" "}
                  <span className="font-medium text-white">{Math.min(indexOfLastItem, filteredUsers.length)}</span> of{" "}
                  <span className="font-medium text-white">{filteredUsers.length}</span> results
                </div>
                
                <div className="flex items-center gap-2">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-gray-700 border border-gray-600 text-white rounded-md px-2 py-1 text-sm"
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                  
                  <nav className="flex items-center gap-1">
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronLeft size={14} />
                    </button>
                    
                    <div className="flex items-center">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Show pagination with ellipsis for many pages
                        let pageToShow;
                        if (totalPages <= 5) {
                          pageToShow = i + 1;
                        } else {
                          if (currentPage <= 3) {
                            pageToShow = i + 1;
                            if (i === 4) pageToShow = totalPages;
                          } else if (currentPage >= totalPages - 2) {
                            pageToShow = totalPages - 4 + i;
                          } else {
                            pageToShow = currentPage - 2 + i;
                            if (i === 0) pageToShow = 1;
                            if (i === 4) pageToShow = totalPages;
                          }
                        }
                        
                        return (
                          <button
                            key={i}
                            onClick={() => paginate(pageToShow)}
                            className={`w-8 h-8 flex items-center justify-center rounded-md mx-1 ${
                              currentPage === pageToShow
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                          >
                            {pageToShow}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="p-2 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronRight size={14} />
                    </button>
                  </nav>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
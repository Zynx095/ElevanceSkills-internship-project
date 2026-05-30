import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { Calendar, Search } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
const users = [
  {
    id: 1,
    name: "John Doe",
    username: "johndoe",
    joinDate: "2019-03-15",
  },
  {
    id: 2,
    name: "Felix Rodriguez",
    username: "Felix.leg",
    joinDate: "2020-07-22",
  },
  {
    id: 3,
    name: "Alex Smith",
    username: "Aledi5",
    joinDate: "2023-11-10",
  },
  {
    id: 4,
    name: "Sarah Johnson",
    username: "PR0X",
    joinDate: "2024-01-05",
  },
];
const index = () => {
  const [users, setusers] = useState<any>(null);
  const [loading, setloading] = useState(true);
  useEffect(() => {
    const fetchuser = async () => {
      try {
        const res = await axiosInstance.get("/user/getalluser");
        setusers(res.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchuser();
  }, []);
  if (loading) {
    return (
      <Mainlayout>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </Mainlayout>
    );
  }
  if (!users || users.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-4">No users found.</div>
    );
  }
  return (
    <Mainlayout>
      <div className="max-w-6xl">
        <h1 className="text-xl lg:text-2xl font-semibold mb-6">Users</h1>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Filter by user" className="pl-10" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {users.map((user: any) => (
            <Link key={user._id} href={`/users/${user._id}`}>
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center mb-3">
                  <Avatar className="w-12 h-12 mr-3">
                    <AvatarFallback className="text-lg">
                      {user.name
                        .split(" ")
                        .map((n: any) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-blue-600 hover:text-blue-800 truncate">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      @{user.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Joined {new Date(user.joinDate).getFullYear()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Mainlayout>
  );
};

export default index;

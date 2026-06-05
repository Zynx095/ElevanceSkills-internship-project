import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { Calendar, Search } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const getHighestBadge = (badges: string[] = []) => {
  if (badges.includes("Elite Contributor")) return "👑";
  if (badges.includes("Gold Contributor")) return "🥇";
  if (badges.includes("Silver Contributor")) return "🥈";
  if (badges.includes("Bronze Contributor")) return "🥉";
  return "";
};

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
                    <h3 className="font-semibold text-blue-600 hover:text-blue-800 truncate flex items-center gap-1">
                      <span>{getHighestBadge(user.badges)}</span> {user.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      @{user.name.toLowerCase().replace(/\s/g, "")}
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
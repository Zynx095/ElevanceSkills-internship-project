import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Calendar, Edit, Plus, X } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const index = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [users, setusers] = useState<any>(null);
  const [loading, setloading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: users?.name || "",
    about: users?.about || "",
    tags: users?.tags || [],
  });
  const [newTag, setNewTag] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [transferPoints, setTransferPoints] = useState("");

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState("");

  useEffect(() => {
    const fetchuser = async () => {
      try {
        const res = await axiosInstance.get("/user/getalluser");
        const matcheduser = res.data.data.find((u: any) => u._id === id);
        setusers(matcheduser);
        setAllUsers(res.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchuser();
  }, [id]);

  if (loading) {
    return (
      <Mainlayout>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </Mainlayout>
    );
  }

  if (!users || users.length === 0) {
    return <div className="text-center text-gray-500 mt-4">No user found.</div>;
  }

  const handleSaveProfile = async () => {
    try {
      const res = await axiosInstance.patch(`/user/update/${user?._id}`, {
        editForm,
      });
      if (res.data.data) {
        const updatedUser = {
          ...users,
          name: editForm.name,
          about: editForm.about,
          tags: editForm.tags,
        };

        setusers(updatedUser);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !editForm.tags.includes(trimmedTag)) {
      setEditForm({ ...editForm, tags: [...editForm.tags, trimmedTag] });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditForm({
      ...editForm,
      tags: editForm.tags.filter((tag: any) => tag !== tagToRemove),
    });
  };
  const handleSendFriendRequest = async () => {
    try {
      const res = await axiosInstance.post(
        "/user/send-friend-request",
        {
          senderId: user?._id,
          receiverId: users?._id
        }
      );

      toast.success(res.data.message);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to send request"
      );
    }
  };
  const handleAcceptRequest = async (
    senderId: string
  ) => {
    try {
      const res = await axiosInstance.post(
        "/user/accept-friend-request",
        {
          userId: user?._id,
          senderId
        }
      );

      toast.success(res.data.message);

      const refetch =
        await axiosInstance.get(
          "/user/getalluser"
        );

      const matcheduser =
        refetch.data.data.find(
          (u: any) => u._id === id
        );

      setusers(matcheduser);
      setAllUsers(refetch.data.data);
    } catch (error) {
      toast.error(
        "Failed to accept request"
      );
    }
  };


  const handleTransferPoints = async () => {
    try {
      const res = await axiosInstance.post(
        "/user/transfer-points",
        {
          senderId: user?._id,
          receiverId,
          points: Number(transferPoints)
        }
      );

      toast.success(res.data.message);

      setReceiverId("");
      setSearchUser("");
      setTransferPoints("");

      const refetch = await axiosInstance.get("/user/getalluser");
      const matcheduser = refetch.data.data.find((u: any) => u._id === id);
      setusers(matcheduser);

    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Transfer failed"
      );
    }
  };

  const currentUserId = user?._id;
  const isOwnProfile = id === currentUserId;
  const friendCount = users?.friends?.length || 0;
  const dailyLimit =
    friendCount >= 10
      ? "Unlimited"
      : friendCount;

  const filteredUsers = allUsers.filter(
    (u) =>
      u._id !== user?._id &&
      u.name.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <Mainlayout>
      <div className="max-w-6xl">
        {/* User Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-8">
          <Avatar className="w-24 h-24 lg:w-32 lg:h-32">
            <AvatarFallback className="text-2xl lg:text-3xl">
              {users.name
                .split(" ")
                .map((n: any) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1">
                  {users.name}
                </h1>
              </div>

              {isOwnProfile ? (
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-gray-900">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                          Basic Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Display Name</Label>
                            <Input
                              id="name"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Your display name"
                            />
                          </div>
                        </div>
                      </div>
                      {/* About Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">About</h3>
                        <div>
                          <Label htmlFor="about">About Me</Label>
                          <Textarea
                            id="about"
                            value={editForm.about}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                about: e.target.value,
                              })
                            }
                            placeholder="Tell us about yourself, your experience, and interests..."
                            className="min-h-32"
                          />
                        </div>
                      </div>

                      {/* Tags/Skills Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                          Skills & Technologies
                        </h3>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              placeholder="Add a skill or technology"
                              onKeyPress={(e) =>
                                e.key === "Enter" && handleAddTag()
                              }
                            />
                            <Button
                              onClick={handleAddTag}
                              variant="outline"
                              size="sm"
                              className="bg-orange-600 text-white"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {editForm.tags.map((tag: any) => {
                              return (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="bg-orange-100 text-orange-800 flex items-center gap-1"
                                >
                                  {tag}
                                  <button
                                    onClick={() => handleRemoveTag(tag)}
                                    className="ml-1 hover:text-red-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          className="bg-white text-gray-800 hover:text-gray-900"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

              ) : (
                <Button
                  onClick={handleSendFriendRequest}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Add Friend
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Member since{" "}
                {new Date(users.joinDate).toISOString().split("T")[0]}
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-semibold text-lg">
                {users.rewardPoints || 0}
              </span>
              <span className="text-gray-600">
                Reward Points
              </span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-semibold text-lg">
                {users.friends?.length || 0}
              </span>
              <span className="text-gray-600">
                Friends
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {users.badges && users.badges.map((badge: string) => {  
                let emoji = "";
                if (badge === "Elite Contributor") emoji = "👑";
                else if (badge === "Gold Contributor") emoji = "🥇";
                else if (badge === "Silver Contributor") emoji = "🥈";
                else if (badge === "Bronze Contributor") emoji = "🥉";

                return (
                  <Badge key={badge} variant="outline" className="flex items-center gap-1 text-sm bg-gray-50">
                    <span>{emoji}</span> {badge}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
        <h2 className="text-xl font-semibold mt-6">
          Login History
        </h2>

        <div className="space-y-2 mt-3">
          {users.loginHistory?.map((log: any, index: number) => (
            <div
              key={index}
              className="border p-3 rounded"
            >
              <p>Browser: {log.browser}</p>
              <p>OS: {log.os}</p>
              <p>Device: {log.device}</p>
              <p>IP: {log.ip}</p>
              <p>
                Time:
                {new Date(log.loginTime)
                  .toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Friend Requests</CardTitle>
          </CardHeader>

          <CardContent>
            {users.friendRequests?.length > 0 ? (
              users.friendRequests.map(
                (requestId: string) => {
                  const sender =
                    allUsers.find(
                      (u) => u._id === requestId
                    );

                  return (
                    <div
                      key={requestId}
                      className="flex justify-between items-center mb-2"
                    >
                      <span>
                        {sender?.name}
                      </span>

                      <Button
                        size="sm"
                        onClick={() =>
                          handleAcceptRequest(
                            requestId
                          )
                        }
                      >
                        Accept
                      </Button>
                    </div>
                  );
                }
              )
            ) : (
              <p>No friend requests</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Friends</CardTitle>
          </CardHeader>

          <CardContent>
            {users.friends?.length > 0 ? (
              users.friends.map((friendId: string) => {
                const friend = allUsers.find(
                  (u) => u._id === friendId
                );

                return (
                  <div
                    key={friendId}
                    className="flex justify-between items-center mb-2 border-b pb-2"
                  >
                    <span>
                      {friend?.name}
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(
                          `/users/${friendId}`
                        )
                      }
                    >
                      View
                    </Button>
                  </div>
                );
              })
            ) : (
              <p>No friends yet</p>
            )}
          </CardContent>
        </Card>
        <Card className="mb-6">
          <CardContent className="pt-4">
            <p>
              Friends: {friendCount}
            </p>

            <p>
              Daily Question Limit: {dailyLimit}
            </p>

            {friendCount === 0 && (
              <p className="text-red-500">
                You need at least 1 friend
                before posting questions.
              </p>
            )}
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {users.about}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">

            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {users.badges && users.badges.length > 0 ? (
                    users.badges.map((badge: string) => {
                      let emoji = "";
                      if (badge === "Elite Contributor") emoji = "👑";
                      else if (badge === "Gold Contributor") emoji = "🥇";
                      else if (badge === "Silver Contributor") emoji = "🥈";
                      else if (badge === "Bronze Contributor") emoji = "🥉";

                      return (
                        <div key={badge} className="flex items-center gap-2 text-gray-800 font-medium">
                          <span className="text-xl">{emoji}</span>
                          {badge}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-sm">No achievements earned yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transfer Reward Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input
                    placeholder="Search user..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                  />

                  {filteredUsers.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border rounded">
                      {filteredUsers.slice(0, 5).map((u) => (
                        <div
                          key={u._id}
                          className="p-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setReceiverId(u._id);
                            setSearchUser(u.name);
                          }}
                        >
                          {u.name}
                        </div>
                      ))}
                    </div>
                  )}

                  <Input
                    type="number"
                    placeholder="Points"
                    value={transferPoints}
                    onChange={(e) => setTransferPoints(e.target.value)}
                  />
                  <Button onClick={handleTransferPoints}>
                    Transfer Points
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transfer History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users?.transferHistory && users.transferHistory.length > 0 ? (
                    [...users.transferHistory]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((historyItem: any, index: number) => (
                        <div key={index} className="border-b pb-2 last:border-0 last:pb-0">
                          <div className="font-medium text-sm">
                            {historyItem.type === "SENT" ? (
                              <span className="text-red-600">
                                SENT {historyItem.points} points to {historyItem.otherUserName}
                              </span>
                            ) : (
                              <span className="text-green-600">
                                RECEIVED {historyItem.points} points from {historyItem.otherUserName}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(historyItem.date).toISOString().split("T")[0]}
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-gray-500 text-sm">No transfer history available.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.tags && users.tags.map((tag: string) => (
                    <div
                      key={tag}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                        >
                          {tag}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Mainlayout>
  );
};

export default index;
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Upload } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { formatBytes } from "@/lib/utils";

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch the profile picture from the proxy endpoint
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        console.log("Fetching profile picture from proxy endpoint...");

        const response = await fetch("http://127.0.0.1:8000/api/auth/profile/picture/proxy/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch profile picture. Status: ${response.status}`);
        }

        // Convert the response to a blob and create a local URL
        const blob = await response.blob();
        console.log("Blob fetched successfully:", blob);

        const localUrl = URL.createObjectURL(blob);
        console.log("Local URL created:", localUrl);

        setProfilePictureUrl(localUrl);
        console.log("Profile picture URL set successfully.");
      } catch (error) {
        console.error("Error fetching profile picture:", error);
        toast.error("Failed to load profile picture");
      }
    };

    fetchProfilePicture();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.email) {
      toast.error("Username and email are required");
      return;
    }

    setIsUpdating(true);

    try {
      const updatedUser = await authService.updateProfile(formData);
      updateUser(updatedUser);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploadingPicture(true);

    try {
      const formData = new FormData();
      formData.append("profile_picture", file);

      const response = await authService.updateProfilePicture(formData);
      toast.success(response.message || "Profile picture updated successfully");

      // Fetch the updated profile picture
      const blob = await fetch("http://127.0.0.1:8000/api/auth/profile/picture/proxy/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then((res) => res.blob());
      const localUrl = URL.createObjectURL(blob);
      setProfilePictureUrl(localUrl);
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
      toast.error(error.message || "Failed to upload profile picture");
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isUpdating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isUpdating}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-filehub hover:bg-filehub-dark"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Upload a new profile picture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Avatar className="h-32 w-32 border-2 border-gray-200">
                <AvatarImage
                  src={profilePictureUrl || ""}
                  alt="Profile Picture"
                />
                <AvatarFallback className="text-2xl bg-filehub text-white">
                  {user?.username ? getInitials(user.username) : <User />}
                </AvatarFallback>
              </Avatar>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleProfilePictureUpload}
              />

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPicture}
                className="w-full"
              >
                {isUploadingPicture ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Upload Photo</span>
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;

import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { authService } from "@/services/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ResetPasswordPage: React.FC = () => {
  const { userId, token } = useParams<{ userId: string; token: string }>();
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.resetPassword(userId!, token!, newPassword);
      toast.success("Password reset successfully");
      setNewPassword("");
    } catch (error) {
      console.error("Failed to reset password:", error);
      toast.error(error.message || "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Enter your new password</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button
                onClick={handleResetPassword}
                disabled={isSubmitting}
                className="w-full bg-filehub hover:bg-filehub-dark"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { authAPI } from "@/utils/authAPI";
import { toast } from "sonner";

export function SignupForm({ className, ...props }) {  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    ManagerInviteToken: "",
    SupervisorInviteToken: "",
  });
  const [showManagerToken, setShowManagerToken] = useState(false);
  const [showSupervisorToken, setShowSupervisorToken] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) clearError();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setProfileImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleImageAreaKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerFileInput();
    }
  };const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    try {
      setImageUploading(true);
      let profileImageUrl = "";

      if (profileImage) {
        const uploadResponse = await authAPI.uploadImage(profileImage);
        profileImageUrl = uploadResponse.imageUrl;
      }      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        profileImageUrl: profileImageUrl,
      };      if (formData.ManagerInviteToken.trim()) {
        userData.ManagerInviteToken = formData.ManagerInviteToken.trim();
        console.log('Sending Manager Token:', userData.ManagerInviteToken);
      }

      if (formData.SupervisorInviteToken.trim()) {
        userData.SupervisorInviteToken = formData.SupervisorInviteToken.trim();
        console.log('Sending Supervisor Token:', userData.SupervisorInviteToken);
      }

      console.log('Final userData being sent:', userData);      await register(userData);
      
      // Determine success message based on role
      let roleMessage = "member";
      if (formData.SupervisorInviteToken.trim()) {
        roleMessage = "supervisor";
      } else if (formData.ManagerInviteToken.trim()) {
        roleMessage = "manager";
      }
      
      toast.success(`Registration successful as ${roleMessage}! Please login to continue.`);
      navigate('/login');
    } catch (error) {
      console.error("Registration failed:", error);
      // The AuthContext already handles the error display, but we can add specific handling
      if (error.message && error.message.includes('Invalid')) {
        toast.error(error.message);
      }
    } finally {
      setImageUploading(false);
    }
  };

  const getButtonText = () => {
    if (imageUploading) return "Uploading Image...";
    if (loading) return "Creating Account...";
    return "Create Account";
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your details below to create your account
        </p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/20">
          {error}
        </div>
      )}      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

    
        <div className="grid gap-3">
          <Label>Profile Picture (Optional)</Label>
          <div className="flex flex-col items-center gap-4">            <div className="relative">
              <div 
                className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer flex items-center justify-center overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={triggerFileInput}
                onKeyDown={handleImageAreaKeyDown}
                tabIndex={0}
                role="button"
                aria-label="Upload profile picture"
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p className="text-xs text-gray-500">Add Photo</p>
                  </div>
                )}
              </div>
              
              {imagePreview && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm transition-colors"
                  title="Remove image"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            {!imagePreview && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={triggerFileInput}
                className="text-sm"
              >
                Choose Image
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters with uppercase, lowercase, and number
          </p>
        </div>

        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="text-xs text-destructive">Passwords do not match</p>
          )}
        </div>        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showManagerToken"
            checked={showManagerToken}
            onChange={(e) => {
              setShowManagerToken(e.target.checked)
              if (e.target.checked) {
                setShowSupervisorToken(false)
              }
            }}
            className="rounded border-input"
          />
          <Label htmlFor="showManagerToken" className="text-sm">
            I have a Manager invite token
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showSupervisorToken"
            checked={showSupervisorToken}
            onChange={(e) => {
              setShowSupervisorToken(e.target.checked)
              if (e.target.checked) {
                setShowManagerToken(false)
              }
            }}
            className="rounded border-input"
          />
          <Label htmlFor="showSupervisorToken" className="text-sm">
            I have a Supervisor invite token
          </Label>
        </div>{showManagerToken && (
          <div className="grid gap-3">
            <Label htmlFor="ManagerInviteToken">Manager Invite Token</Label>
            <Input
              id="ManagerInviteToken"
              name="ManagerInviteToken"
              type="text"
              placeholder="Enter Manager invite token"
              value={formData.ManagerInviteToken}
              onChange={handleChange}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to register as a regular member
            </p>
          </div>
        )}

        {showSupervisorToken && (
          <div className="grid gap-3">
            <Label htmlFor="SupervisorInviteToken">Supervisor Invite Token</Label>
            <Input
              id="SupervisorInviteToken"
              name="SupervisorInviteToken"
              type="text"
              placeholder="Enter Supervisor invite token"
              value={formData.SupervisorInviteToken}
              onChange={handleChange}
            />
            <p className="text-xs text-muted-foreground">
              This will register you as a supervisor
            </p>
          </div>
        )}<Button 
          type="submit" 
          className="w-full"
          disabled={loading || imageUploading || formData.password !== formData.confirmPassword}
        >
          {getButtonText()}
        </Button>
      </div>

      <div className="text-center text-sm">
        Already have an account?{' '}
        <Link to="/login" className="underline underline-offset-4">
          Sign in
        </Link>
      </div>
    </form>
  );
}

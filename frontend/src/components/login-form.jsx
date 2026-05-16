import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export function LoginForm({
  className,
  ...props
}) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    isManager: false,
    isSupervisor: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { login, loading, clearError } = useAuth();
  const navigate = useNavigate();  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear any existing error when user starts typing
    if (showErrorDialog) {
      setShowErrorDialog(false);
      setErrorMessage("");
    }
    clearError();
  };

  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorDialog(true);
  };

  const closeErrorDialog = () => {
    setShowErrorDialog(false);
    setErrorMessage("");
    clearError();
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.email.trim()) {
      showError("Please enter your email address.");
      return;
    }
    
    if (!formData.password.trim()) {
      showError("Please enter your password.");
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      showError("Please enter a valid email address.");
      return;
    }
    
    try {
      const user = await login({
        email: formData.email.trim(),
        password: formData.password
      });
      
      // Show success toast
      toast.success(`Welcome back, ${user.name}!`);
      
      // Redirect based on checkbox selections and user role
      if (formData.isSupervisor) {
        if (user.role === 'supervisor') {
          navigate('/supervisor/dashboard');
        } else {
          showError('Access denied. You do not have Supervisor privileges for this account.');
          return;
        }
      } else if (formData.isManager) {
        if (user.role === 'manager') {
          navigate('/manager/dashboard');
        } else {
          showError('Access denied. You do not have Manager privileges for this account.');
          return;
        }
      } else {
        // Default redirect based on user role
        switch (user.role) {
          case 'supervisor':
            navigate('/supervisor/dashboard');
            break;
          case 'manager':
            navigate('/manager/dashboard');
            break;
          case 'member':
            navigate('/member/dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Show specific error messages based on the error
      if (error.message) {
        if (error.message.includes('Invalid email or password') || 
            error.message.includes('Invalid credentials') ||
            error.message.includes('Incorrect')) {
          showError("Invalid email or password. Please check your credentials and try again.");
        } else if (error.message.includes('User not found')) {
          showError("No account found with this email address. Please check your email or sign up for a new account.");
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          showError("Network error. Please check your internet connection and try again.");
        } else {
          showError(error.message);
        }
      } else {
        showError("Login failed. Please check your credentials and try again.");
      }
    }
  };
  return (
    <>
      <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>

        <div className="grid gap-6">
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
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isManager"
                name="isManager"
                checked={formData.isManager}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    isManager: checked,
                    isSupervisor: checked ? false : prev.isSupervisor
                  }))
                }
              />
              <Label htmlFor="isManager" className="text-sm font-medium">
                Login as Manager
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isSupervisor"
                name="isSupervisor"
                checked={formData.isSupervisor}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    isSupervisor: checked,
                    isManager: checked ? false : prev.isManager
                  }))
                }
              />
              <Label htmlFor="isSupervisor" className="text-sm font-medium">
                Login as Supervisor
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
        </div>
        
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="underline underline-offset-4">
            Sign up
          </Link>
        </div>
      </form>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Login Failed
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={closeErrorDialog} className="bg-destructive hover:bg-destructive/90">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

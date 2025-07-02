
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Error signing in", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Signed in successfully!" });
      navigate('/');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    if (error) {
      toast({ title: "Error signing up", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email for the confirmation link!" });
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Please enter your email address", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) {
      toast({ title: "Error sending reset email", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password reset email sent!", description: "Check your email for the reset link." });
      setShowForgotPassword(false);
    }
    setLoading(false);
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-card text-card-foreground rounded-lg shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-center">Reset Password</h1>
          <p className="text-center text-muted-foreground">Enter your email to receive a password reset link</p>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Sending Reset Email...' : 'Send Reset Email'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowForgotPassword(false)} 
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-card text-card-foreground rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center">Heart Of Christ</h1>
        <p className="text-center text-muted-foreground">
          {isSignUp ? 'Create your account' : 'Sign in to your account'}
        </p>
        
        <div className="flex justify-center mb-6">
          <div className="flex rounded-lg bg-muted p-1">
            <Button
              type="button"
              variant={!isSignUp ? "default" : "ghost"}
              size="sm"
              onClick={() => setIsSignUp(false)}
              className="rounded-md"
            >
              Sign In
            </Button>
            <Button
              type="button"
              variant={isSignUp ? "default" : "ghost"}
              size="sm"
              onClick={() => setIsSignUp(true)}
              className="rounded-md"
            >
              Sign Up
            </Button>
          </div>
        </div>

        <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
          {isSignUp && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
          )}
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading 
              ? (isSignUp ? 'Creating Account...' : 'Signing In...') 
              : (isSignUp ? 'Create Account' : 'Sign In')
            }
          </Button>
          
          {!isSignUp && (
            <div className="text-center">
              <Button 
                type="button" 
                variant="link" 
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Forgot your password?
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthPage;

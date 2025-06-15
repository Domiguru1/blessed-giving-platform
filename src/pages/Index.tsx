
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Index = () => {
  const { user, profile, signOut, loading, roles } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  const displayName =
    (profile?.first_name || profile?.last_name)
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
      : user?.email;

  const isAdmin = roles.includes('admin');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Heart of Christ</h1>
        {user ? (
          <div className="space-y-4">
            <p className="text-xl text-muted-foreground">You are logged in as {displayName}</p>
            <div className="flex flex-wrap justify-center gap-4">
              {isAdmin && (
                <Button asChild variant="secondary">
                  <Link to="/admin">Admin Dashboard</Link>
                </Button>
              )}
              <Button asChild>
                <Link to="/contribute">Make a Contribution</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/history">View History</Link>
              </Button>
              <Button asChild>
                <Link to="/profile">Profile</Link>
              </Button>
              <Button onClick={signOut}>Sign Out</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xl text-muted-foreground">Giving made simple. Please sign in to continue.</p>
            <Button asChild>
              <Link to="/auth">Login / Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

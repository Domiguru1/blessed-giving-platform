
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard = () => {
  const { profile, user } = useAuth();
  const displayName =
    (profile?.first_name || profile?.last_name)
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
      : user?.email;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
            <CardDescription>Welcome, {displayName}.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the admin dashboard. You can manage users, contributions, and other settings from here.</p>
            <div className="mt-4">
                <Button asChild variant="outline">
                    <Link to="/">Back to Home</Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

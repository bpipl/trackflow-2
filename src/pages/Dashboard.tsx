
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Users, 
  FileText, 
  TrendingUp 
} from 'lucide-react';
import { EnvironmentInfo } from '@/components/EnvironmentInfo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon 
}: { 
  title: string;
  value: string;
  description?: string;
  icon: React.ElementType;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </CardContent>
  </Card>
);

const QuickAction = ({ 
  title, 
  description, 
  icon: Icon, 
  to 
}: { 
  title: string;
  description: string;
  icon: React.ElementType;
  to: string;
}) => (
  <Card className="h-full">
    <CardHeader>
      <div className="flex items-center">
        <div className="mr-3 rounded-md bg-courier-100 p-2">
          <Icon className="h-5 w-5 text-courier-700" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <CardDescription className="mb-4">{description}</CardDescription>
      <Button asChild variant="outline" className="border-courier-300 text-courier-700 hover:bg-courier-50">
        <Link to={to}>Get Started</Link>
      </Button>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user, logout } = useAuth();

  // In a real app, these would come from an API
  const stats = {
    totalSlips: "128",
    totalCustomers: "84",
    totalCouriers: "6",
    weeklyGrowth: "+12.5%"
  };

  return (
    <PageLayout title="Dashboard" userRole={user?.role} onLogout={logout}>
      <div className="space-y-6">
        {/* Environment Information Banner */}
        <EnvironmentInfo />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user?.username}!</h2>
            <p className="text-muted-foreground">
              Here's what's happening with your courier operations today.
            </p>
          </div>
          <div className="mt-4 flex space-x-4 md:mt-0">
            <Button asChild className="bg-courier-600 hover:bg-courier-700">
              <Link to="/slips">Generate New Slip</Link>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Slips Generated"
            value={stats.totalSlips}
            description="This month"
            icon={FileText}
          />
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers}
            description="In database"
            icon={Users}
          />
          <StatCard
            title="Courier Partners"
            value={stats.totalCouriers}
            description="Active partners"
            icon={Package}
          />
          <StatCard
            title="Weekly Growth"
            value={stats.weeklyGrowth}
            description="Compared to last week"
            icon={TrendingUp}
          />
        </div>

        {/* Quick Actions */}
        <h3 className="mt-8 text-lg font-medium">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickAction
            title="Generate Courier Slip"
            description="Create a new courier slip for shipment"
            icon={FileText}
            to="/slips"
          />
          <QuickAction
            title="Manage Customers"
            description="Add or edit customer information"
            icon={Users}
            to="/customers"
          />
          <QuickAction
            title="Manage Couriers"
            description="Add or update courier partner details"
            icon={Package}
            to="/couriers"
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;

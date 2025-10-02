import { useState } from "react";
import { Activity, MessageSquare, Users, TrendingUp, Sparkles, Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "@/components/Sidebar";
import MetricCard from "@/components/MetricCard";
import UserLeaderboard from "@/components/UserLeaderboard";
import RecentMessages from "@/components/RecentMessages";
import BotConfig from "@/components/BotConfig";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { data: metrics, isLoading } = useDashboardMetrics();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                <Bot className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Telegram AI Bot Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground">Monitor and control your AI-powered Telegram bot</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Users"
                  value={isLoading ? "..." : metrics?.totalUsers.toString() || "0"}
                  change="Real-time"
                  icon={Users}
                  trend="up"
                />
                <MetricCard
                  title="Messages Today"
                  value={isLoading ? "..." : metrics?.messagesToday.toString() || "0"}
                  change="Real-time"
                  icon={MessageSquare}
                  trend="up"
                />
                <MetricCard
                  title="Active Conversations"
                  value={isLoading ? "..." : metrics?.activeConversations.toString() || "0"}
                  change="Last 24h"
                  icon={Activity}
                  trend="up"
                />
                <MetricCard
                  title="Images Generated"
                  value={isLoading ? "..." : metrics?.imagesGenerated.toString() || "0"}
                  change="All time"
                  icon={Sparkles}
                  trend="up"
                />
              </div>

              {/* Activity Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border bg-gradient-to-br from-card to-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Top Active Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UserLeaderboard />
                  </CardContent>
                </Card>

                <Card className="border-border bg-gradient-to-br from-card to-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-accent" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RecentMessages />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <UserLeaderboard expanded />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Message History</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentMessages expanded />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="config">
              <BotConfig />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;

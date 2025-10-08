import { Bot, LayoutDashboard, Users, MessageSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}
const Sidebar = ({
  activeTab,
  setActiveTab
}: SidebarProps) => {
  const navItems = [{
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard
  }, {
    id: "users",
    label: "Users",
    icon: Users
  }, {
    id: "messages",
    label: "Messages",
    icon: MessageSquare
  }, {
    id: "config",
    label: "Configuration",
    icon: Settings
  }];
  return <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
          <Bot className="w-6 h-6 text-primary-foreground" />
        </div>
        <span className="font-bold text-xl">BOTSLY AI</span>
      </div>

      <nav className="space-y-2">
        {navItems.map(item => {
        const Icon = item.icon;
        return <button key={item.id} onClick={() => setActiveTab(item.id)} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all", "hover:bg-secondary/50", activeTab === item.id ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary shadow-lg shadow-primary/20" : "text-muted-foreground")}>
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>;
      })}
      </nav>
    </aside>;
};
export default Sidebar;
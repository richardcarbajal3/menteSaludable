import {
  Home,
  Heart,
  BookOpen,
  Book,
  TrendingUp,
  Target,
  Settings,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Estado de Ánimo",
    url: "/mood",
    icon: Heart,
  },
  {
    title: "Recursos",
    url: "/resources",
    icon: BookOpen,
  },
  {
    title: "Diario",
    url: "/journal",
    icon: Book,
  },
  {
    title: "Tendencias",
    url: "/trends",
    icon: TrendingUp,
  },
  {
    title: "Metas",
    url: "/goals",
    icon: Target,
  },
  {
    title: "Configuración",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <h2 className="text-xl font-semibold text-foreground">MentalCare</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.url === "/" ? "dashboard" : item.url.slice(1)}`}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

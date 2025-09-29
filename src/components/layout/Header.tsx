import { TrendingUp, FileText, BarChart3, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GoogleConnect } from "@/components/auth/GoogleConnect";

interface HeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  user?: { name: string; email: string; avatar?: string };
  onGoogleConnected: (accessToken: string) => void;
  isGoogleConnected: boolean;
}

export const Header = ({ activeSection, onSectionChange, user, onGoogleConnected, isGoogleConnected }: HeaderProps) => {
  const menuItems = [
    { id: "resumo", label: "Resumo Financeiro", icon: TrendingUp },
    { id: "contas", label: "Contas/Faturas", icon: FileText },
    { id: "fluxo", label: "Fluxo de Caixa", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-primary border-b shadow-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">
                FinThrix – Meu Controle Financeiro
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => onSectionChange(item.id)}
                    className={`text-white hover:bg-white/20 ${
                      activeSection === item.id 
                        ? "bg-white/20 text-white" 
                        : ""
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <GoogleConnect 
              onConnected={onGoogleConnected}
              isConnected={isGoogleConnected}
            />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-white/20 text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-white/20 text-white hover:bg-white/30 border-white/30"
              >
                Conectar Google
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
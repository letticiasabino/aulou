"use client";

import { Bell, LogOut, Menu, Upload } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Topbar({ title = "Dashboard" }: { title?: string }) {
  const { user, signOut } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
          <Menu />
        </Button>
        <div className="hidden md:block">
          <SearchInput placeholder="Buscar arquivos, tarefas, aulas..." />
        </div>
        <h1 className="text-lg font-semibold md:hidden">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary">
          <Upload data-icon="inline-start" />
          Importar
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notificações">
          <Bell />
        </Button>
        <ThemeToggle />
        <Avatar>
          <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() ?? "SP"}</AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="icon" aria-label="Sair" onClick={() => void signOut()}>
          <LogOut />
        </Button>
      </div>
    </header>
  );
}

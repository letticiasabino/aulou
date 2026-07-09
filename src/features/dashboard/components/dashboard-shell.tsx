import { CalendarDays, FileUp, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CalendarPlaceholder } from "@/components/ui/calendar-placeholder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const cards = [
  { title: "Arquivos importados", value: "0", icon: FileUp },
  { title: "Eventos confirmados", value: "0", icon: CalendarDays },
  { title: "Plano ativo", value: "Mock", icon: Sparkles },
  { title: "Saúde acadêmica", value: "--", icon: TrendingUp },
];

export function DashboardShell() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Layout pronto para receber agenda, importações, tarefas e estatísticas reais.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex flex-col gap-2">
                <CardDescription>{card.title}</CardDescription>
                <CardTitle className="text-2xl">{card.value}</CardTitle>
              </div>
              <card.icon className="text-primary" aria-hidden="true" />
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Calendário acadêmico</CardTitle>
            <CardDescription>Placeholder visual para a Sprint 1.</CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarPlaceholder />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas tarefas</CardTitle>
            <CardDescription>Mock de tarefas até a engine real entrar.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {["Revisar eventos importados", "Conectar Supabase", "Preparar upload"].map((task) => (
              <div
                key={task}
                className="flex items-center justify-between rounded-md border bg-background p-3"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">{task}</span>
                  <span className="text-xs text-muted-foreground">Aguardando integração</span>
                </div>
                <Badge variant="secondary">Mock</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Importações recentes</CardTitle>
          <CardDescription>Tabela estrutural para previews futuros.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Arquivo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Eventos</TableHead>
                <TableHead>Confiança</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((item) => (
                <TableRow key={item}>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

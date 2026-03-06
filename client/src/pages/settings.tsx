import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Moon, Sun, Trash2, Download, FileJson, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { apiRequest } from "@/lib/queryClient";
import type { User as UserType, MoodEntry, JournalEntry } from "@shared/schema";
import { useState } from "react";

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/user"],
  });

  const { data: moodEntries = [] } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood-entries"],
  });

  const { data: journalEntries = [] } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
  });

  const updateUser = useMutation({
    mutationFn: async (data: { name?: string; prefersDarkMode?: boolean }) => {
      return await apiRequest("PATCH", "/api/user", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Configuración actualizada",
        description: "Tus preferencias han sido guardadas.",
      });
    },
  });

  const handleNameUpdate = () => {
    if (name.trim()) {
      updateUser.mutate({ name: name.trim() });
    }
  };

  const handleThemeToggle = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";
    setTheme(newTheme);
    updateUser.mutate({ prefersDarkMode: checked });
  };

  const exportToJSON = (data: any[], filename: string) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exportación exitosa",
      description: `Datos exportados como ${filename}.json`,
    });
  };

  const exportToCSV = (data: any[], headers: string[], filename: string) => {
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });
    
    const csvStr = csvRows.join('\n');
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exportación exitosa",
      description: `Datos exportados como ${filename}.csv`,
    });
  };

  const handleExportMoodJSON = () => {
    exportToJSON(moodEntries, `mentalcare_mood_entries_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportMoodCSV = () => {
    const headers = ['id', 'mood', 'notes', 'createdAt'];
    exportToCSV(moodEntries, headers, `mentalcare_mood_entries_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportJournalJSON = () => {
    exportToJSON(journalEntries, `mentalcare_journal_entries_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportJournalCSV = () => {
    const headers = ['id', 'content', 'createdAt', 'updatedAt'];
    exportToCSV(journalEntries, headers, `mentalcare_journal_entries_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-4xl font-light text-foreground" data-testid="text-settings-title">
          Configuración
        </h1>
        <p className="text-muted-foreground">
          Personaliza tu experiencia en MentalCare Companion
        </p>
      </div>

      {/* Profile Settings */}
      <Card data-testid="card-profile">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil
          </CardTitle>
          <CardDescription>
            Actualiza tu información personal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <div className="flex gap-3">
              <Input
                id="name"
                placeholder={user?.name || "Tu nombre"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-name"
              />
              <Button
                onClick={handleNameUpdate}
                disabled={!name.trim() || updateUser.isPending}
                data-testid="button-update-name"
              >
                {updateUser.isPending ? "Guardando..." : "Actualizar"}
              </Button>
            </div>
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Nombre actual: <span className="font-medium text-foreground" data-testid="text-current-name">{user?.name || "Sin configurar"}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card data-testid="card-appearance">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Apariencia
          </CardTitle>
          <CardDescription>
            Personaliza cómo se ve la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="dark-mode" className="text-base">Modo Oscuro</Label>
              <p className="text-sm text-muted-foreground">
                Reduce la fatiga visual en ambientes con poca luz
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={theme === "dark"}
              onCheckedChange={handleThemeToggle}
              data-testid="switch-dark-mode"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card data-testid="card-export">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Datos
          </CardTitle>
          <CardDescription>
            Descarga tus registros para uso personal o terapéutico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mood Entries Export */}
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-foreground mb-1">Registros de Estado de Ánimo</h4>
              <p className="text-sm text-muted-foreground">
                {moodEntries.length} {moodEntries.length === 1 ? 'registro' : 'registros'} disponibles
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handleExportMoodJSON}
                disabled={moodEntries.length === 0}
                className="gap-2"
                data-testid="button-export-mood-json"
              >
                <FileJson className="h-4 w-4" />
                Exportar como JSON
              </Button>
              <Button
                variant="outline"
                onClick={handleExportMoodCSV}
                disabled={moodEntries.length === 0}
                className="gap-2"
                data-testid="button-export-mood-csv"
              >
                <FileText className="h-4 w-4" />
                Exportar como CSV
              </Button>
            </div>
          </div>

          <div className="border-t pt-6">
            {/* Journal Entries Export */}
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-foreground mb-1">Entradas de Diario</h4>
                <p className="text-sm text-muted-foreground">
                  {journalEntries.length} {journalEntries.length === 1 ? 'entrada' : 'entradas'} disponibles
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={handleExportJournalJSON}
                  disabled={journalEntries.length === 0}
                  className="gap-2"
                  data-testid="button-export-journal-json"
                >
                  <FileJson className="h-4 w-4" />
                  Exportar como JSON
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportJournalCSV}
                  disabled={journalEntries.length === 0}
                  className="gap-2"
                  data-testid="button-export-journal-csv"
                >
                  <FileText className="h-4 w-4" />
                  Exportar como CSV
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 mt-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Nota:</strong> Los archivos exportados contienen información personal sensible. 
              Guárdalos de forma segura y no los compartas sin tu consentimiento.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card data-testid="card-data">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Datos y Privacidad
          </CardTitle>
          <CardDescription>
            Gestiona tu información personal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="font-medium text-foreground mb-2">Tu información está segura</h4>
            <p className="text-sm text-muted-foreground">
              Todos tus datos se almacenan de forma segura y privada. Tus registros emocionales, 
              entradas de diario y progreso son completamente privados.
            </p>
          </div>
          <div className="pt-4 border-t">
            <Button variant="destructive" className="gap-2" data-testid="button-delete-data">
              <Trash2 className="h-4 w-4" />
              Eliminar todos mis datos
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Esta acción no se puede deshacer. Se eliminarán todos tus registros permanentemente.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <Card data-testid="card-summary">
        <CardHeader>
          <CardTitle>Resumen de Actividad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-accent/50">
              <p className="text-sm text-muted-foreground mb-1">Miembro desde</p>
              <p className="text-lg font-semibold text-foreground" data-testid="text-member-since">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                }) : "Hoy"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-accent/50">
              <p className="text-sm text-muted-foreground mb-1">Tema preferido</p>
              <p className="text-lg font-semibold text-foreground capitalize" data-testid="text-theme-pref">
                {theme === "dark" ? "Oscuro" : "Claro"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-accent/50">
              <p className="text-sm text-muted-foreground mb-1">Estado</p>
              <p className="text-lg font-semibold text-success" data-testid="text-status">
                Activo
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

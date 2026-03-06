import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BookOpen, Plus, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { JournalEntry } from "@shared/schema";

export default function JournalPage() {
  const [isWriting, setIsWriting] = useState(false);
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
  });

  const createEntry = useMutation({
    mutationFn: async (data: { content: string }) => {
      return await apiRequest("POST", "/api/journal-entries", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      toast({
        title: "Entrada guardada",
        description: "Tu reflexión ha sido guardada con éxito.",
      });
      setContent("");
      setIsWriting(false);
    },
    onError: () => {
      toast({
        title: "Error al guardar",
        description: "No pudimos guardar tu entrada. Intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!content.trim()) {
      toast({
        title: "Escribe algo primero",
        description: "Tu entrada no puede estar vacía.",
        variant: "destructive",
      });
      return;
    }

    createEntry.mutate({ content: content.trim() });
  };

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-light text-foreground" data-testid="text-journal-title">
            Mi Diario Personal
          </h1>
          <p className="text-muted-foreground">
            Un espacio seguro para tus pensamientos y reflexiones
          </p>
        </div>
        {!isWriting && (
          <Button
            onClick={() => setIsWriting(true)}
            className="gap-2"
            data-testid="button-new-entry"
          >
            <Plus className="h-4 w-4" />
            Nueva entrada
          </Button>
        )}
      </div>

      {/* New Entry Card */}
      {isWriting && (
        <Card data-testid="card-new-entry">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Nueva Entrada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="¿Qué está en tu mente hoy? Escribe libremente..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-48 resize-none focus:ring-2"
              autoFocus
              data-testid="input-journal-content"
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsWriting(false);
                  setContent("");
                }}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!content.trim() || createEntry.isPending}
                data-testid="button-save-entry"
              >
                {createEntry.isPending ? "Guardando..." : "Guardar entrada"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entries Timeline */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Tus Reflexiones</h2>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedEntries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center" data-testid="empty-journal">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Aún no tienes entradas
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Comienza a escribir tus pensamientos y reflexiones diarias
              </p>
              <Button onClick={() => setIsWriting(true)} data-testid="button-start-writing">
                Escribir primera entrada
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedEntries.map((entry) => (
              <Card
                key={entry.id}
                className="hover-elevate transition-all duration-200"
                data-testid={`card-entry-${entry.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span data-testid={`text-entry-date-${entry.id}`}>
                      {format(new Date(entry.createdAt), "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed" data-testid={`text-entry-content-${entry.id}`}>
                    {entry.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

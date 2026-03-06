import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Smile, Sparkles, Wind, Frown, Meh } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { MoodType } from "@shared/schema";

const MOODS = [
  { value: "happy", label: "Feliz", icon: Smile, color: "bg-mood-happy" },
  { value: "calm", label: "Tranquilo", icon: Sparkles, color: "bg-mood-calm" },
  { value: "anxious", label: "Ansioso", icon: Wind, color: "bg-mood-anxious" },
  { value: "sad", label: "Triste", icon: Frown, color: "bg-mood-sad" },
  { value: "neutral", label: "Neutral", icon: Meh, color: "bg-mood-neutral" },
] as const;

export default function MoodPage() {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const createMoodEntry = useMutation({
    mutationFn: async (data: { mood: MoodType; notes?: string }) => {
      return await apiRequest("POST", "/api/mood-entries", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood-entries"] });
      toast({
        title: "¡Registrado con éxito!",
        description: "Tu estado de ánimo ha sido guardado.",
      });
      setSelectedMood(null);
      setNotes("");
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error al guardar",
        description: "No pudimos registrar tu estado de ánimo. Intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedMood) {
      toast({
        title: "Selecciona un estado de ánimo",
        description: "Por favor, elige cómo te sientes hoy.",
        variant: "destructive",
      });
      return;
    }

    createMoodEntry.mutate({
      mood: selectedMood,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-4xl font-light text-foreground" data-testid="text-mood-title">
          ¿Cómo te sientes hoy?
        </h1>
        <p className="text-muted-foreground">
          Registra tu estado emocional para hacer seguimiento de tu bienestar
        </p>
      </div>

      <Card data-testid="card-mood-selector">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Selecciona tu estado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Mood Selection Grid */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {MOODS.map((mood) => {
              const IconComponent = mood.icon;
              return (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  data-testid={`button-mood-${mood.value}`}
                  className={`
                    relative flex flex-col items-center gap-3 p-4 rounded-2xl
                    transition-all duration-200 hover:scale-105 active:scale-95
                    ${selectedMood === mood.value 
                      ? "ring-4 ring-primary shadow-lg" 
                      : "hover-elevate active-elevate-2"
                    }
                  `}
                >
                  <div className={`
                    w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center
                    ${mood.color} bg-opacity-20
                  `}>
                    <IconComponent className="h-8 w-8 md:h-10 md:w-10" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {mood.label}
                  </span>
                  {selectedMood === mood.value && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Notes Section */}
          <div className="space-y-3">
            <label htmlFor="mood-notes" className="text-sm font-medium text-foreground">
              Notas adicionales (opcional)
            </label>
            <Textarea
              id="mood-notes"
              placeholder="¿Qué ha pasado hoy? ¿Hay algo en particular que quieras recordar?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-32 resize-none focus:ring-2"
              data-testid="input-mood-notes"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!selectedMood || createMoodEntry.isPending}
              className="min-w-32"
              data-testid="button-save-mood"
            >
              {createMoodEntry.isPending ? "Guardando..." : "Guardar registro"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Entries Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Entradas recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            Tus registros aparecerán aquí una vez que empieces a guardarlos
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

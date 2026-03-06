import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Target, Plus, Check, Trash2, Calendar, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Goal } from "@shared/schema";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function GoalsPage() {
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const createGoal = useMutation({
    mutationFn: async (data: { title: string; description?: string; targetDate?: string }) => {
      return await apiRequest("POST", "/api/goals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Meta creada",
        description: "Tu objetivo de bienestar ha sido registrado.",
      });
      setTitle("");
      setDescription("");
      setTargetDate("");
      setShowNewGoal(false);
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Goal> }) => {
      return await apiRequest("PATCH", `/api/goals/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Meta actualizada",
        description: "El progreso ha sido guardado.",
      });
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/goals/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Meta eliminada",
        description: "El objetivo ha sido removido.",
      });
    },
  });

  const handleCreateGoal = () => {
    if (!title.trim()) {
      toast({
        title: "Título requerido",
        description: "Por favor, ingresa un título para tu meta.",
        variant: "destructive",
      });
      return;
    }

    createGoal.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      targetDate: targetDate || undefined,
    });
  };

  const handleToggleComplete = (goal: Goal) => {
    updateGoal.mutate({
      id: goal.id,
      data: {
        completed: !goal.completed,
        completedAt: !goal.completed ? new Date().toISOString() : null,
      } as any,
    });
  };

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-light text-foreground" data-testid="text-goals-title">
            Metas y Objetivos
          </h1>
          <p className="text-muted-foreground">
            Define y alcanza tus objetivos de bienestar mental
          </p>
        </div>
        <Button
          onClick={() => setShowNewGoal(!showNewGoal)}
          className="gap-2"
          data-testid="button-toggle-new-goal"
        >
          <Plus className="h-4 w-4" />
          Nueva Meta
        </Button>
      </div>

      {/* New Goal Form */}
      {showNewGoal && (
        <Card data-testid="card-new-goal">
          <CardHeader>
            <CardTitle>Crear Nueva Meta</CardTitle>
            <CardDescription>
              Define un objetivo específico para tu bienestar emocional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal-title">Título *</Label>
              <Input
                id="goal-title"
                placeholder="Ej: Meditar 10 minutos diarios"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="input-goal-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-description">Descripción (opcional)</Label>
              <Textarea
                id="goal-description"
                placeholder="¿Por qué es importante esta meta para ti?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                data-testid="input-goal-description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-target-date">Fecha objetivo (opcional)</Label>
              <Input
                id="goal-target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                data-testid="input-goal-target-date"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleCreateGoal}
                disabled={createGoal.isPending}
                data-testid="button-save-goal"
              >
                {createGoal.isPending ? "Guardando..." : "Guardar Meta"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewGoal(false);
                  setTitle("");
                  setDescription("");
                  setTargetDate("");
                }}
                data-testid="button-cancel-goal"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Metas activas</p>
                <p className="text-2xl font-semibold text-foreground" data-testid="text-active-goals">
                  {activeGoals.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/20">
                <Trophy className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completadas</p>
                <p className="text-2xl font-semibold text-success" data-testid="text-completed-goals">
                  {completedGoals.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent-warm/20">
                <Check className="h-6 w-6 text-accent-warm" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tasa de éxito</p>
                <p className="text-2xl font-semibold text-foreground" data-testid="text-success-rate">
                  {goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No hay metas definidas
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crea tu primera meta de bienestar para comenzar tu camino
            </p>
            <Button onClick={() => setShowNewGoal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Crear Primera Meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Metas Activas</h2>
              {activeGoals.map((goal) => (
                <Card key={goal.id} className="hover-elevate transition-all" data-testid={`card-goal-${goal.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleToggleComplete(goal)}
                            data-testid={`button-complete-${goal.id}`}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-foreground">{goal.title}</h3>
                            {goal.description && (
                              <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                            )}
                          </div>
                        </div>
                        {goal.targetDate && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground ml-14">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Objetivo: {format(new Date(goal.targetDate), "d 'de' MMMM, yyyy", { locale: es })}
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteGoal.mutate(goal.id)}
                        data-testid={`button-delete-${goal.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Metas Completadas</h2>
              {completedGoals.map((goal) => (
                <Card key={goal.id} className="border-success/30 bg-success/5" data-testid={`card-completed-${goal.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-success" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-foreground line-through">{goal.title}</h3>
                            {goal.description && (
                              <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                            )}
                          </div>
                          <Badge variant="secondary" className="bg-success/20 text-success">
                            Completada
                          </Badge>
                        </div>
                        {goal.completedAt && (
                          <p className="text-xs text-muted-foreground ml-14">
                            Logrado el {format(new Date(goal.completedAt), "d 'de' MMMM, yyyy", { locale: es })}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteGoal.mutate(goal.id)}
                        data-testid={`button-delete-completed-${goal.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

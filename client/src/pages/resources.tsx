import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, CheckCircle2, Circle, Sparkles, Wind, BookOpen, Dumbbell, Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Resource, CompletedResource } from "@shared/schema";

const CATEGORY_CONFIG = {
  meditation: { label: "Meditación", icon: Sparkles, color: "bg-mood-calm" },
  breathing: { label: "Respiración", icon: Wind, color: "bg-mood-happy" },
  article: { label: "Artículo", icon: BookOpen, color: "bg-primary" },
  exercise: { label: "Ejercicio", icon: Dumbbell, color: "bg-accent-warm" },
};

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 60]);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: resources = [], isLoading: resourcesLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  const { data: completedResources = [], isLoading: completedLoading } = useQuery<CompletedResource[]>({
    queryKey: ["/api/completed-resources"],
  });

  const toggleComplete = useMutation({
    mutationFn: async ({ resourceId, isCompleted }: { resourceId: string; isCompleted: boolean }) => {
      if (isCompleted) {
        const completed = completedResources.find(c => c.resourceId === resourceId);
        if (completed) {
          return await apiRequest("DELETE", `/api/completed-resources/${completed.id}`, {});
        }
      } else {
        return await apiRequest("POST", "/api/completed-resources", { resourceId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/completed-resources"] });
      toast({
        title: "Actualizado",
        description: "Estado del recurso actualizado correctamente.",
      });
    },
  });

  const filteredResources = resources.filter(resource => {
    // Category filter
    if (selectedCategory && resource.category !== selectedCategory) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = resource.title.toLowerCase().includes(query);
      const matchesDescription = resource.description.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDescription) {
        return false;
      }
    }

    // Duration filter
    if (resource.duration !== null && resource.duration !== undefined) {
      if (resource.duration < durationRange[0] || resource.duration > durationRange[1]) {
        return false;
      }
    }

    return true;
  });

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery("");
    setDurationRange([0, 60]);
  };

  const hasActiveFilters = selectedCategory !== null || searchQuery !== "" || durationRange[0] !== 0 || durationRange[1] !== 60;

  const isResourceCompleted = (resourceId: string) => {
    return completedResources.some(c => c.resourceId === resourceId);
  };

  const categories = Object.entries(CATEGORY_CONFIG);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-4xl font-light text-foreground" data-testid="text-resources-title">
          Biblioteca de Recursos
        </h1>
        <p className="text-muted-foreground">
          Explora artículos, meditaciones y ejercicios para tu bienestar
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por título o descripción..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
          data-testid="input-search-resources"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
            onClick={() => setSearchQuery("")}
            data-testid="button-clear-search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Category Filters */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            data-testid="filter-all"
          >
            Todos
          </Button>
          {categories.map(([key, config]) => {
            const Icon = config.icon;
            return (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                onClick={() => setSelectedCategory(key)}
                data-testid={`filter-${key}`}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {config.label}
              </Button>
            );
          })}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            data-testid="button-toggle-filters"
            className="gap-2"
          >
            {showFilters ? "Ocultar" : "Más"} Filtros
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              data-testid="button-clear-filters"
              className="gap-2 text-muted-foreground"
            >
              <X className="h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Duración (minutos)
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <label htmlFor="min-duration" className="text-xs text-muted-foreground">
                        Mínimo
                      </label>
                      <Input
                        id="min-duration"
                        type="number"
                        min={0}
                        max={60}
                        value={durationRange[0]}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setDurationRange([Math.min(value, durationRange[1]), durationRange[1]]);
                        }}
                        data-testid="input-min-duration"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label htmlFor="max-duration" className="text-xs text-muted-foreground">
                        Máximo
                      </label>
                      <Input
                        id="max-duration"
                        type="number"
                        min={0}
                        max={60}
                        value={durationRange[1]}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 60;
                          setDurationRange([durationRange[0], Math.max(value, durationRange[0])]);
                        }}
                        data-testid="input-max-duration"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Count */}
      {!resourcesLoading && !completedLoading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground" data-testid="text-results-count">
            {filteredResources.length === resources.length
              ? `Mostrando todos los recursos (${resources.length})`
              : `${filteredResources.length} de ${resources.length} recursos`}
          </p>
        </div>
      )}

      {/* Resources Grid */}
      {resourcesLoading || completedLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center" data-testid="empty-resources">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {selectedCategory ? "No hay recursos en esta categoría" : "No hay recursos disponibles"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Pronto añadiremos más contenido para ti
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => {
            const isCompleted = isResourceCompleted(resource.id);
            const categoryConfig = CATEGORY_CONFIG[resource.category as keyof typeof CATEGORY_CONFIG];
            const Icon = categoryConfig?.icon || BookOpen;

            return (
              <Card 
                key={resource.id} 
                className="hover-elevate transition-all duration-200 relative"
                data-testid={`card-resource-${resource.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${categoryConfig?.color} bg-opacity-20`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-medium leading-tight">
                          {resource.title}
                        </CardTitle>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleComplete.mutate({ 
                        resourceId: resource.id, 
                        isCompleted 
                      })}
                      data-testid={`button-toggle-${resource.id}`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {resource.description}
                  </p>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="gap-1">
                      {categoryConfig?.label}
                    </Badge>
                    {resource.duration && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{resource.duration} min</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Progress Summary */}
      <Card data-testid="card-progress-summary">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Tu Progreso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Completados</span>
                <span className="font-medium text-foreground" data-testid="text-progress">
                  {completedResources.length} de {resources.length}
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-success transition-all duration-500 rounded-full"
                  style={{
                    width: `${resources.length > 0 ? (completedResources.length / resources.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

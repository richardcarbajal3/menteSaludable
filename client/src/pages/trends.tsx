import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Calendar, Heart, Sparkles, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { MoodEntry } from "@shared/schema";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const MOOD_LABELS = {
  happy: "Feliz",
  calm: "Tranquilo",
  anxious: "Ansioso",
  sad: "Triste",
  neutral: "Neutral"
};

const MOOD_COLORS = {
  happy: "#f59e0b",
  calm: "#3b82f6",
  anxious: "#a855f7",
  sad: "#64748b",
  neutral: "#9ca3af"
};

export default function TrendsPage() {
  const { data: moodEntries = [], isLoading } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood-entries"],
  });

  // Calculate mood distribution
  const moodDistribution = moodEntries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(moodDistribution).map(([mood, count]) => ({
    name: MOOD_LABELS[mood as keyof typeof MOOD_LABELS],
    value: count,
    color: MOOD_COLORS[mood as keyof typeof MOOD_COLORS]
  }));

  // Most common mood
  const mostCommonMood = Object.entries(moodDistribution).sort((a, b) => b[1] - a[1])[0];

  // Weekly mood trend
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weeklyData = weekDays.map(day => {
    const dayEntries = moodEntries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return format(entryDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
    });

    const moodCounts = dayEntries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      day: format(day, 'EEE', { locale: es }),
      ...moodCounts
    };
  });

  // Monthly comparison
  const last30Days = moodEntries.filter(entry => {
    const entryDate = new Date(entry.createdAt);
    return entryDate >= subDays(new Date(), 30);
  });

  const previous30Days = moodEntries.filter(entry => {
    const entryDate = new Date(entry.createdAt);
    return entryDate >= subDays(new Date(), 60) && entryDate < subDays(new Date(), 30);
  });

  // Generate insights
  const insights = [];
  
  if (mostCommonMood) {
    const moodName = MOOD_LABELS[mostCommonMood[0] as keyof typeof MOOD_LABELS];
    const percentage = ((mostCommonMood[1] / moodEntries.length) * 100).toFixed(0);
    insights.push({
      icon: Heart,
      title: "Estado de ánimo predominante",
      description: `Te has sentido ${moodName.toLowerCase()} el ${percentage}% de las veces.`,
      color: "text-primary"
    });
  }

  if (last30Days.length > previous30Days.length) {
    const increase = ((last30Days.length - previous30Days.length) / (previous30Days.length || 1) * 100).toFixed(0);
    insights.push({
      icon: TrendingUp,
      title: "Mayor constancia",
      description: `Has registrado ${increase}% más entradas este mes comparado con el anterior.`,
      color: "text-success"
    });
  }

  const positiveCount = moodEntries.filter(e => e.mood === "happy" || e.mood === "calm").length;
  const positivePct = (positiveCount / moodEntries.length) * 100;
  const positivePercentage = positivePct.toFixed(0);
  
  if (positivePct >= 60) {
    insights.push({
      icon: Sparkles,
      title: "Bienestar positivo",
      description: `El ${positivePercentage}% de tus registros reflejan emociones positivas.`,
      color: "text-mood-happy"
    });
  }

  // Wellness suggestions
  const suggestions = [];

  if (moodDistribution.anxious && moodDistribution.anxious > moodEntries.length * 0.3) {
    suggestions.push({
      title: "Practica técnicas de respiración",
      description: "Has registrado ansiedad con frecuencia. Los ejercicios de respiración pueden ayudarte a reducir el estrés.",
      action: "Ver ejercicios de respiración"
    });
  }

  if (moodDistribution.sad && moodDistribution.sad > moodEntries.length * 0.3) {
    suggestions.push({
      title: "Conéctate con tu diario",
      description: "Expresar tus pensamientos por escrito puede ayudarte a procesar emociones difíciles.",
      action: "Ir al diario"
    });
  }

  if (!suggestions.length) {
    suggestions.push({
      title: "Mantén tu práctica de mindfulness",
      description: "Tu equilibrio emocional muestra estabilidad. Continúa con tus hábitos de bienestar.",
      action: "Explorar recursos"
    });
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-4xl font-light text-foreground" data-testid="text-trends-title">
          Análisis de Tendencias
        </h1>
        <p className="text-muted-foreground">
          Descubre patrones en tu bienestar emocional y recibe insights personalizados
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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
      ) : moodEntries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No hay suficientes datos
            </h3>
            <p className="text-sm text-muted-foreground">
              Registra tu estado de ánimo regularmente para ver análisis y tendencias
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Insights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <Card key={index} data-testid={`card-insight-${index}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-accent/20`}>
                        <Icon className={`h-6 w-6 ${insight.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground mb-1">{insight.title}</h3>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mood Distribution Pie Chart */}
            <Card data-testid="card-mood-distribution">
              <CardHeader>
                <CardTitle>Distribución de Estados de Ánimo</CardTitle>
                <CardDescription>Proporción de cada emoción registrada</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.name} (${entry.value})`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Trend Bar Chart */}
            <Card data-testid="card-weekly-trend">
              <CardHeader>
                <CardTitle>Tendencia Semanal</CardTitle>
                <CardDescription>Estados de ánimo por día de la semana</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {Object.keys(MOOD_COLORS).map((mood) => (
                      <Bar
                        key={mood}
                        dataKey={mood}
                        stackId="a"
                        fill={MOOD_COLORS[mood as keyof typeof MOOD_COLORS]}
                        name={MOOD_LABELS[mood as keyof typeof MOOD_LABELS]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Wellness Suggestions */}
          <Card data-testid="card-suggestions">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Sugerencias de Bienestar
              </CardTitle>
              <CardDescription>
                Recomendaciones personalizadas basadas en tus patrones emocionales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-card hover-elevate transition-all"
                  data-testid={`suggestion-${index}`}
                >
                  <h4 className="font-medium text-foreground mb-2">{suggestion.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
                  <Badge variant="secondary" className="cursor-pointer">
                    {suggestion.action}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total de registros</p>
                  <p className="text-3xl font-semibold text-foreground" data-testid="text-total-entries">
                    {moodEntries.length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Últimos 30 días</p>
                  <p className="text-3xl font-semibold text-foreground" data-testid="text-last-30-days">
                    {last30Days.length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Emociones positivas</p>
                  <p className="text-3xl font-semibold text-success" data-testid="text-positive-percent">
                    {positivePercentage}%
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Estado más común</p>
                  <p className="text-2xl font-semibold text-foreground" data-testid="text-most-common">
                    {mostCommonMood ? MOOD_LABELS[mostCommonMood[0] as keyof typeof MOOD_LABELS] : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

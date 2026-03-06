import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfDay, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { Heart, BookOpen, Book, TrendingUp, Smile, Frown, Meh, Sparkles, Wind } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { MoodEntry, JournalEntry, CompletedResource } from "@shared/schema";

const MOOD_COLORS = {
  happy: "hsl(var(--mood-happy))",
  calm: "hsl(var(--mood-calm))",
  anxious: "hsl(var(--mood-anxious))",
  sad: "hsl(var(--mood-sad))",
  neutral: "hsl(var(--mood-neutral))",
};

const MOOD_LABELS = {
  happy: "Feliz",
  calm: "Tranquilo",
  anxious: "Ansioso",
  sad: "Triste",
  neutral: "Neutral",
};

const MOOD_ICON_COMPONENTS = {
  happy: Smile,
  calm: Sparkles,
  anxious: Wind,
  sad: Frown,
  neutral: Meh,
};

export default function Dashboard() {
  const { data: moodEntries = [], isLoading: moodLoading } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood-entries"],
  });

  const { data: journalEntries = [], isLoading: journalLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
  });

  const { data: completedResources = [], isLoading: resourcesLoading } = useQuery<CompletedResource[]>({
    queryKey: ["/api/completed-resources"],
  });

  // Get last 7 days mood data for chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = startOfDay(subDays(new Date(), 6 - i));
    return date;
  });

  const moodChartData = last7Days.map((date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    // Backend returns desc order, so find first (most recent) entry for this date
    const dayEntry = moodEntries.find(
      (entry) => format(new Date(entry.createdAt), "yyyy-MM-dd") === dateStr
    );
    
    const moodValue = dayEntry
      ? dayEntry.mood === "happy" ? 5
      : dayEntry.mood === "calm" ? 4
      : dayEntry.mood === "neutral" ? 3
      : dayEntry.mood === "anxious" ? 2
      : 1
      : 0;

    return {
      date: format(date, "EEE", { locale: es }),
      mood: moodValue,
      fullDate: dateStr,
    };
  });

  // Backend returns entries in desc order, so first entry is newest
  const todayMood = moodEntries.length > 0 
    ? moodEntries[0].mood 
    : null;

  // Calculate actual streak (consecutive days with mood entries)
  const calculateStreak = () => {
    if (moodEntries.length === 0) return 0;
    
    let streak = 0;
    const today = startOfDay(new Date());
    
    // Group entries by date
    const entriesByDate = new Map<string, MoodEntry>();
    moodEntries.forEach(entry => {
      const dateKey = format(startOfDay(new Date(entry.createdAt)), "yyyy-MM-dd");
      if (!entriesByDate.has(dateKey)) {
        entriesByDate.set(dateKey, entry);
      }
    });
    
    // Count consecutive days backwards from today
    let currentDate = today;
    while (true) {
      const dateKey = format(currentDate, "yyyy-MM-dd");
      if (!entriesByDate.has(dateKey)) break;
      streak++;
      currentDate = subDays(currentDate, 1);
    }
    
    return streak;
  };

  const streak = calculateStreak();
  const journalCount = journalEntries.length;
  const resourcesCompleted = completedResources.length;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-light text-foreground flex items-center gap-3" data-testid="text-welcome">
          ¡Bienvenido!
        </h1>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/mood">
          <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-200" data-testid="card-mood-action">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-accent-warm/20">
                  <Heart className="h-6 w-6 text-accent-warm" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Registrar Estado</h3>
                  <p className="text-sm text-muted-foreground">¿Cómo te sientes hoy?</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/resources">
          <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-200" data-testid="card-resources-action">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/20">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Explorar Recursos</h3>
                  <p className="text-sm text-muted-foreground">Artículos y ejercicios</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/journal">
          <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-200" data-testid="card-journal-action">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-success/20">
                  <Book className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Mi Diario</h3>
                  <p className="text-sm text-muted-foreground">Reflexiones personales</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Mood Summary and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Mood Card */}
        <Card className="lg:col-span-2" data-testid="card-mood-summary">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Tu Estado Actual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {moodLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : todayMood ? (
              <>
                <div className="flex items-center gap-4 p-6 rounded-2xl" 
                  style={{ backgroundColor: `${MOOD_COLORS[todayMood as keyof typeof MOOD_COLORS]}20` }}>
                  <div className="p-4 rounded-full" 
                    style={{ backgroundColor: `${MOOD_COLORS[todayMood as keyof typeof MOOD_COLORS]}30` }}
                    data-testid="text-current-mood">
                    {(() => {
                      const IconComponent = MOOD_ICON_COMPONENTS[todayMood as keyof typeof MOOD_ICON_COMPONENTS];
                      return <IconComponent className="h-12 w-12" style={{ color: MOOD_COLORS[todayMood as keyof typeof MOOD_COLORS] }} />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium text-foreground">
                      {MOOD_LABELS[todayMood as keyof typeof MOOD_LABELS]}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Última actualización: {format(new Date(moodEntries[0]?.createdAt), "HH:mm")}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">Últimos 7 días</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={moodChartData}>
                      <defs>
                        <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="date" 
                        className="text-xs text-muted-foreground"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis 
                        domain={[0, 5]} 
                        ticks={[1, 2, 3, 4, 5]}
                        className="text-xs text-muted-foreground"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="hsl(var(--primary))" 
                        fill="url(#moodGradient)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="text-center py-12" data-testid="empty-mood">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Aún no has registrado tu estado de ánimo
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Comienza a rastrear cómo te sientes para ver tu progreso
                </p>
                <Link href="/mood">
                  <Button data-testid="button-register-mood">
                    Registrar ahora
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="space-y-6">
          <Card data-testid="card-stats-streak">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-muted-foreground">
                Racha de Registros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold text-foreground" data-testid="text-streak">
                  {streak}
                </span>
                <span className="text-muted-foreground">días</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                <span>Continúa así</span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stats-journal">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-muted-foreground">
                Entradas de Diario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold text-foreground" data-testid="text-journal-count">
                  {journalCount}
                </span>
                <span className="text-muted-foreground">entradas</span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stats-resources">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-muted-foreground">
                Recursos Completados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold text-foreground" data-testid="text-resources-count">
                  {resourcesCompleted}
                </span>
                <span className="text-muted-foreground">recursos</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

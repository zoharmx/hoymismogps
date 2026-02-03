import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calendar, Download, Globe, Loader2, Moon, Star } from "lucide-react";
import { Link, useParams } from "wouter";

export default function ChartView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const { data, isLoading } = trpc.birthChart.getById.useQuery({
    id: parseInt(id || "0"),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Carta natal no encontrada</h2>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver al Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { chart, mazalAnalysis } = data;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
            </Link>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Descargar PDF
            </Button>
          </div>

          {/* Title Card */}
          <Card className="border-primary/20 bg-gradient-astral text-white">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-3xl">
                    {chart.personName || "Carta Natal Cabalística"}
                  </CardTitle>
                  <CardDescription className="text-white/80 text-lg">
                    {chart.dayName} • {chart.planet} • {chart.sefira}
                  </CardDescription>
                </div>
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                  <Star className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="mazal">Análisis de Mazal</TabsTrigger>
              <TabsTrigger value="dates">Fechas</TabsTrigger>
              <TabsTrigger value="spiritual">Guía Espiritual</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Información de Nacimiento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Fecha Gregoriana</div>
                      <div className="font-semibold">
                        {new Date(chart.gregorianDate).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {chart.birthHour.toString().padStart(2, '0')}:{chart.birthMinute.toString().padStart(2, '0')}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Fecha Hebrea</div>
                      <div className="font-semibold">{chart.hebrewDate}</div>
                      <div className="text-sm text-muted-foreground">
                        {chart.hebrewDay} de {chart.hebrewMonth} {chart.hebrewYear}
                      </div>
                    </div>
                    {chart.birthCity && (
                      <>
                        <Separator />
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Ubicación</div>
                          <div className="font-semibold">
                            {chart.birthCity}{chart.birthCountry && `, ${chart.birthCountry}`}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-secondary" />
                      Influencias Planetarias
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Día de la Semana</div>
                      <div className="font-semibold text-lg">{chart.dayName}</div>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Planeta Regente</div>
                      <div className="font-semibold text-lg text-primary">{chart.planet}</div>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Sefirá</div>
                      <div className="font-semibold text-lg text-secondary">{chart.sefira}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-accent" />
                    Ciclo Hebreo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Año en Ciclo</div>
                      <div className="font-semibold text-2xl">{chart.yearInCycle}/19</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Tipo de Año</div>
                      <div className="font-semibold text-2xl">
                        {chart.isLeapYear ? "13 meses" : "12 meses"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Ciclo Número</div>
                      <div className="font-semibold text-2xl">{chart.cycleNumber}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Mazal Analysis Tab */}
            <TabsContent value="mazal" className="space-y-6">
              {mazalAnalysis ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Características Principales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {mazalAnalysis.characteristics.map((char: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <Star className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                            <span>{char}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-primary/20">
                      <CardHeader>
                        <CardTitle className="text-primary">Fortalezas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {mazalAnalysis.strengths.map((strength: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                              <span className="text-sm">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-destructive/20">
                      <CardHeader>
                        <CardTitle className="text-destructive">Desafíos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {mazalAnalysis.challenges.map((challenge: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                              <span className="text-sm">{challenge}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-accent/20 bg-accent/5">
                    <CardHeader>
                      <CardTitle>Cita del Talmud</CardTitle>
                      <CardDescription>Talmud Shabat 156a-156b</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <blockquote className="italic border-l-4 border-accent pl-4 py-2">
                        {mazalAnalysis.talmudQuote}
                      </blockquote>
                    </CardContent>
                  </Card>

                  <Card className="border-secondary/20 bg-secondary/5">
                    <CardHeader>
                      <CardTitle>Sabiduría del Zohar</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="leading-relaxed">{mazalAnalysis.zoharInsight}</p>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No hay análisis de mazal disponible
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Dates Tab */}
            <TabsContent value="dates" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Ajuste a Jerusalem
                  </CardTitle>
                  <CardDescription>
                    Según la cosmogonología cabalística, Jerusalem es la referencia temporal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Hora Local de Nacimiento</div>
                    <div className="font-semibold">
                      {chart.birthHour.toString().padStart(2, '0')}:{chart.birthMinute.toString().padStart(2, '0')} ({chart.birthTimezone})
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Hora en Jerusalem</div>
                    <div className="font-semibold">
                      {chart.jerusalemHour.toString().padStart(2, '0')}:{chart.jerusalemMinute.toString().padStart(2, '0')} (Asia/Jerusalem)
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Diferencia Horaria</div>
                    <div className="font-semibold">
                      {chart.timeDifferenceHours > 0 ? '+' : ''}{chart.timeDifferenceHours.toFixed(1)} horas
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Día Hebreo Ajustado</CardTitle>
                  <CardDescription>
                    Los días hebreos comienzan a las 7pm (19:00)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Día Hebreo Original</div>
                      <div className="font-semibold">{chart.hebrewDay}</div>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Día Hebreo Ajustado</div>
                      <div className="font-semibold text-lg text-primary">{chart.adjustedHebrewDay}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Spiritual Guidance Tab */}
            <TabsContent value="spiritual" className="space-y-6">
              {mazalAnalysis ? (
                <>
                  <Card className="border-primary/20">
                    <CardHeader>
                      <CardTitle>Camino Espiritual</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="leading-relaxed">{mazalAnalysis.spiritualPath}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Guía de Vida</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {mazalAnalysis.lifeGuidance.map((guidance: string, index: number) => (
                          <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-semibold text-primary">{index + 1}</span>
                            </div>
                            <span>{guidance}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No hay guía espiritual disponible
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

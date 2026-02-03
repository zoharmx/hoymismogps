import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Calendar, Loader2, MapPin, Plus, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  
  const { data: charts, isLoading: chartsLoading, refetch } = trpc.birthChart.list.useQuery();
  const createChart = trpc.birthChart.create.useMutation();

  const [formData, setFormData] = useState({
    personName: "",
    date: "",
    hour: "12",
    minute: "00",
    city: "",
    country: "",
    timezone: "America/Mexico_City",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date) {
      toast.error("Por favor ingresa una fecha de nacimiento");
      return;
    }

    try {
      const gregorianDate = new Date(formData.date);
      
      await createChart.mutateAsync({
        personName: formData.personName || undefined,
        gregorianDate,
        birthHour: parseInt(formData.hour),
        birthMinute: parseInt(formData.minute),
        birthCity: formData.city || undefined,
        birthCountry: formData.country || undefined,
        birthLatitude: 19.4326, // Default Mexico City
        birthLongitude: -99.1332,
        birthTimezone: formData.timezone,
      });

      toast.success("Carta natal creada exitosamente");
      setShowForm(false);
      setFormData({
        personName: "",
        date: "",
        hour: "12",
        minute: "00",
        city: "",
        country: "",
        timezone: "America/Mexico_City",
      });
      refetch();
    } catch (error) {
      toast.error("Error al crear carta natal");
      console.error(error);
    }
  };

  if (authLoading || chartsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Bienvenido, {user?.name || "Usuario"}
              </p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="w-5 h-5" />
              Nueva Carta Natal
            </Button>
          </div>

          {/* Create Form */}
          {showForm && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Crear Carta Natal Cabalística</CardTitle>
                <CardDescription>
                  Ingresa los datos de nacimiento para generar un análisis completo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="personName">Nombre (opcional)</Label>
                      <Input
                        id="personName"
                        value={formData.personName}
                        onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                        placeholder="Nombre completo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Fecha de Nacimiento *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hour">Hora de Nacimiento *</Label>
                      <Select value={formData.hour} onValueChange={(value) => setFormData({ ...formData, hour: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                              {i.toString().padStart(2, '0')}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minute">Minutos</Label>
                      <Select value={formData.minute} onValueChange={(value) => setFormData({ ...formData, minute: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['00', '15', '30', '45'].map((min) => (
                            <SelectItem key={min} value={min}>
                              :{min}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Ciudad de nacimiento"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">País</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        placeholder="País"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="timezone">Zona Horaria</Label>
                      <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Mexico_City">Ciudad de México (CST)</SelectItem>
                          <SelectItem value="America/New_York">Nueva York (EST)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Los Ángeles (PST)</SelectItem>
                          <SelectItem value="America/Bogota">Bogotá (COT)</SelectItem>
                          <SelectItem value="America/Buenos_Aires">Buenos Aires (ART)</SelectItem>
                          <SelectItem value="Europe/Madrid">Madrid (CET)</SelectItem>
                          <SelectItem value="Asia/Jerusalem">Jerusalem (IST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={createChart.isPending} className="gap-2">
                      {createChart.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4" />
                          Crear Carta Natal
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Charts List */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Mis Cartas Natales</h2>
            
            {charts && charts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {charts.map((chart) => (
                  <Link key={chart.id} href={`/chart/${chart.id}`}>
                    <Card className="hover:border-primary/40 transition-all cursor-pointer h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Star className="w-6 h-6 text-primary" />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(chart.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <CardTitle className="text-lg">
                          {chart.personName || "Carta Natal"}
                        </CardTitle>
                        <CardDescription>
                          {new Date(chart.gregorianDate).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Hebreo:</span>
                            <span className="font-medium">{chart.hebrewDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Planeta:</span>
                            <span className="font-medium">{chart.planet}</span>
                          </div>
                          {chart.birthCity && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">{chart.birthCity}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No hay cartas natales</h3>
                  <p className="text-muted-foreground mb-6">
                    Crea tu primera carta natal cabalística para comenzar
                  </p>
                  <Button onClick={() => setShowForm(true)} className="gap-2">
                    <Plus className="w-5 h-5" />
                    Crear Primera Carta
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

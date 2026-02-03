import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { ArrowRight, Calendar, Star, Globe, BookOpen, Sparkles, Moon } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden pattern-stars">
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        
        <div className="container relative py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Cosmogonología Cabalística Hebrea</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-astral bg-clip-text text-transparent">
                Hoymismogps
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Motor de Inteligencia Astrológica que transforma fechas gregorianas al calendario hebreo 
              y genera cartas natales según la tradición judía con precisión astronómica
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2 glow-gold">
                    Ir al Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="gap-2 glow-gold">
                    Comenzar Ahora
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </a>
              )}
              <Link href="/about">
                <Button size="lg" variant="outline" className="gap-2">
                  <BookOpen className="w-5 h-5" />
                  Aprender Más
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Módulos Computacionales Avanzados</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tecnología de vanguardia aplicada a la sabiduría milenaria cabalística
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Conversión de Calendario</CardTitle>
                <CardDescription>
                  Motor de conversión gregoriano-hebreo con precisión astronómica, 
                  considerando ciclos de intercalación de 19 años
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-secondary/20 hover:border-secondary/40 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle>Análisis de Mazal</CardTitle>
                <CardDescription>
                  Perfiles de personalidad basados en Talmud Shabat 156a-156b 
                  con referencias del Zohar y enseñanzas de Maimónides
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Ajuste a Jerusalem</CardTitle>
                <CardDescription>
                  Sistema de geolocalización que ajusta cálculos tomando Jerusalem 
                  como referencia temporal según cosmogonología cabalística
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Moon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Sistema Astral</CardTitle>
                <CardDescription>
                  Visualización de los 10 niveles cosmogónicos (Sefirot) 
                  desde Keter hasta Malkhut con mapeo planetario hebreo
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-secondary/20 hover:border-secondary/40 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle>Cartas Natales</CardTitle>
                <CardDescription>
                  Generación de cartas natales cabalísticas completas 
                  con análisis de influencias planetarias y rasgos de carácter
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Reportes Detallados</CardTitle>
                <CardDescription>
                  Exportación de análisis completos en PDF con referencias 
                  textuales de Talmud, Zohar y fuentes cabalísticas
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Planetary System Section */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              Sistema Planetario Hebreo
            </h2>
            
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Mapeo de Días y Planetas según Cabalá</CardTitle>
                <CardDescription>
                  Orden hebreo distinto al occidental, basado en el sistema de Sefirot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { day: 'Domingo', planet: 'Júpiter', sefira: 'Jesed', color: 'text-primary' },
                    { day: 'Lunes', planet: 'Marte', sefira: 'Guevurah', color: 'text-destructive' },
                    { day: 'Martes', planet: 'Sol', sefira: 'Tifferet', color: 'text-primary' },
                    { day: 'Miércoles', planet: 'Venus', sefira: 'Netzaj', color: 'text-secondary' },
                    { day: 'Jueves', planet: 'Mercurio', sefira: 'Hod', color: 'text-accent' },
                    { day: 'Viernes', planet: 'Luna', sefira: 'Yesod', color: 'text-secondary' },
                    { day: 'Shabat', planet: 'Saturno', sefira: 'Binah', color: 'text-accent' },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                          <Star className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div>
                          <div className="font-semibold">{item.day}</div>
                          <div className="text-sm text-muted-foreground">{item.sefira}</div>
                        </div>
                      </div>
                      <div className={`font-medium ${item.color}`}>
                        {item.planet}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-astral relative overflow-hidden">
        <div className="absolute inset-0 pattern-stars opacity-30" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Descubre tu Mazal
            </h2>
            <p className="text-xl text-white/90">
              Comienza tu viaje de autodescubrimiento a través de la sabiduría cabalística milenaria
            </p>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="gap-2">
                  Crear mi Carta Natal
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg" variant="secondary" className="gap-2">
                  Comenzar Gratis
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">
              Hoymismogps - Motor Cabalístico de Inteligencia Astrológica
            </p>
            <p className="text-sm">
              Basado en Talmud, Zohar y enseñanzas de Maimónides
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

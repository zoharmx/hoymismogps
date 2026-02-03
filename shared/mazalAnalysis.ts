/**
 * Analizador de Mazal (Suerte/Influencias Astrológicas)
 * Basado en Talmud Shabat 156a:11-156b:3 y Zohar
 */

import { HEBREW_DAY_PLANETS } from './hebrewCalendar';

export interface MazalProfile {
  dayOfWeek: number;
  dayName: string;
  planet: string;
  sefira: string;
  primaryTrait: string;
  characteristics: string[];
  strengths: string[];
  challenges: string[];
  talmudReference: string;
  talmudQuote: string;
  zoharInsight: string;
  creationElement: string;
}

/**
 * Perfiles de mazal según día de nacimiento
 * Basado en referencias del Talmud y tradición cabalística
 */
export const MAZAL_PROFILES: Record<number, MazalProfile> = {
  0: {
    // Domingo - Júpiter
    dayOfWeek: 0,
    dayName: 'Domingo',
    planet: 'Júpiter',
    sefira: 'Jesed (Bondad)',
    primaryTrait: 'Completamente bueno o completamente malo',
    characteristics: [
      'Personalidad extrema sin términos medios',
      'Capacidad de liderazgo excepcional',
      'Naturaleza expansiva y generosa',
      'Tendencia a los extremos en todas las áreas',
      'Potencial para grandeza o caída',
    ],
    strengths: [
      'Liderazgo natural y carisma',
      'Generosidad y bondad cuando está alineado',
      'Capacidad de inspirar a otros',
      'Visión amplia y optimismo',
      'Poder de transformación personal',
    ],
    challenges: [
      'Falta de balance y moderación',
      'Riesgo de arrogancia o egoísmo',
      'Dificultad para encontrar el punto medio',
      'Tendencia a la polarización',
      'Necesidad de autocontrol constante',
    ],
    talmudReference: 'Talmud Shabat 156a:11',
    talmudQuote: 'Aquel que nació el primer día de la semana será una persona y no habrá ser uno en él. Completamente para bien o completamente para mal. ¿Cuál es la razón? Porque tanto la luz como la oscuridad fueron creadas el primer día de la Creación.',
    zoharInsight: 'El alma nacida en Domingo porta la dualidad primordial de la Creación. Como en el primer día surgieron luz y oscuridad, así esta alma contiene el potencial de ambos extremos. Su misión es elegir conscientemente el camino de la luz.',
    creationElement: 'Luz y Oscuridad',
  },
  1: {
    // Lunes - Marte
    dayOfWeek: 1,
    dayName: 'Lunes',
    planet: 'Marte',
    sefira: 'Guevurah (Rigor)',
    primaryTrait: 'Persona de mal genio y temperamento fuerte',
    characteristics: [
      'Temperamento intenso y apasionado',
      'Naturaleza combativa y defensiva',
      'Energía marcial y determinación',
      'Tendencia al conflicto y la confrontación',
      'Capacidad de resistencia excepcional',
    ],
    strengths: [
      'Valentía y coraje inquebrantable',
      'Determinación y persistencia',
      'Capacidad de defender causas justas',
      'Energía y vitalidad abundante',
      'Habilidad para superar obstáculos',
    ],
    challenges: [
      'Control del temperamento y la ira',
      'Tendencia a la agresividad',
      'Dificultad para ceder o comprometerse',
      'Relaciones interpersonales conflictivas',
      'Necesidad de canalizar la energía constructivamente',
    ],
    talmudReference: 'Talmud Shabat 156a:12',
    talmudQuote: 'El que nació el segundo día de la semana será una persona de mal genio. ¿Cuál es la razón? Porque en ese día las aguas superiores e inferiores fueron divididas. Por lo tanto, es un día de contienda.',
    zoharInsight: 'La división de las aguas en el segundo día representa la separación y el juicio. El alma nacida en este día porta la fuerza de Guevurah, el rigor divino. Debe aprender a templar su fuego interior con misericordia.',
    creationElement: 'División de las Aguas',
  },
  2: {
    // Martes - Sol
    dayOfWeek: 2,
    dayName: 'Martes',
    planet: 'Sol',
    sefira: 'Tifferet (Belleza)',
    primaryTrait: 'Rico y promiscuo, abundancia sin límites',
    characteristics: [
      'Naturaleza abundante y generosa',
      'Atracción por la belleza y el placer',
      'Capacidad de crear y prosperar',
      'Tendencia a la indulgencia',
      'Carisma y magnetismo personal',
    ],
    strengths: [
      'Capacidad de generar riqueza y abundancia',
      'Creatividad y fertilidad en proyectos',
      'Generosidad y disposición a compartir',
      'Apreciación de la belleza y el arte',
      'Habilidad para cultivar relaciones',
    ],
    challenges: [
      'Tendencia a la promiscuidad y exceso',
      'Falta de límites y disciplina',
      'Riesgo de dispersión de energía',
      'Necesidad de enfoque y dirección',
      'Balance entre dar y recibir',
    ],
    talmudReference: 'Talmud Shabat 156a:13',
    talmudQuote: 'El que naciera el tercer día de la semana será rico y promiscuo. ¿Cuál es la razón? Porque en ese día se creó la vegetación. Crece abundantemente pero también se mezcla sin límites entre la hierba y las plantas.',
    zoharInsight: 'Como la vegetación del tercer día, el alma nacida en Martes tiene el poder de la multiplicación y el crecimiento. El Sol en Tifferet representa la armonía central, pero debe cuidarse de no dispersar su luz en todas direcciones sin discernimiento.',
    creationElement: 'Vegetación y Plantas',
  },
  3: {
    // Miércoles - Venus
    dayOfWeek: 3,
    dayName: 'Miércoles',
    planet: 'Venus',
    sefira: 'Netzaj (Victoria)',
    primaryTrait: 'Sabio e ilustrado, portador de luz',
    characteristics: [
      'Inteligencia aguda y perspicaz',
      'Amor por el conocimiento y la sabiduría',
      'Capacidad de iluminar a otros',
      'Naturaleza diplomática y armoniosa',
      'Búsqueda constante de belleza y verdad',
    ],
    strengths: [
      'Sabiduría y discernimiento excepcional',
      'Habilidad para enseñar e inspirar',
      'Pensamiento claro y lógico',
      'Capacidad de síntesis y comprensión',
      'Don para las artes y las ciencias',
    ],
    challenges: [
      'Riesgo de intelectualización excesiva',
      'Desconexión de las emociones',
      'Tendencia al perfeccionismo',
      'Dificultad para aceptar la ignorancia',
      'Balance entre mente y corazón',
    ],
    talmudReference: 'Talmud Shabat 156a:14',
    talmudQuote: 'El que naciera el cuarto día de la semana será una persona sabia e ilustrada. ¿Cuál es la razón? Porque las luces celestiales fueron colgadas en los cielos en ese día, y la sabiduría se asemeja a la luz.',
    zoharInsight: 'Las luminarias del cuarto día representan la revelación de la sabiduría divina. Venus en Netzaj otorga victoria a través del conocimiento. Esta alma está destinada a ser un canal de luz para la humanidad.',
    creationElement: 'Luminarias Celestiales',
  },
  4: {
    // Jueves - Mercurio
    dayOfWeek: 4,
    dayName: 'Jueves',
    planet: 'Mercurio',
    sefira: 'Hod (Gloria)',
    primaryTrait: 'Realizador de actos de bondad',
    characteristics: [
      'Naturaleza compasiva y servicial',
      'Comunicación efectiva y elocuente',
      'Adaptabilidad y versatilidad',
      'Deseo de ayudar y servir',
      'Conexión con lo divino a través del servicio',
    ],
    strengths: [
      'Bondad genuina y altruismo',
      'Habilidad para conectar con otros',
      'Comunicación clara y persuasiva',
      'Adaptabilidad a diferentes situaciones',
      'Capacidad de mediar y reconciliar',
    ],
    challenges: [
      'Riesgo de agotamiento por dar demasiado',
      'Dificultad para establecer límites',
      'Tendencia a descuidar necesidades propias',
      'Necesidad de reciprocidad',
      'Balance entre dar y recibir',
    ],
    talmudReference: 'Talmud Shabat 156a:15',
    talmudQuote: 'El que nació el quinto día de la semana será una persona que realiza actos de bondad. ¿Cuál es la razón? Porque en ese día fueron creados los peces y las aves, y no reciben su sustento realizando trabajo para la gente. Son sostenidos solo por la bondad de Dios.',
    zoharInsight: 'Como los peces y las aves que dependen enteramente de la providencia divina, el alma nacida en Jueves comprende que todo sustento proviene de la bondad celestial. Mercurio en Hod refleja la gloria de dar sin esperar recompensa.',
    creationElement: 'Peces y Aves',
  },
  5: {
    // Viernes - Luna
    dayOfWeek: 5,
    dayName: 'Viernes',
    planet: 'Luna',
    sefira: 'Yesod (Fundamento)',
    primaryTrait: 'Buscador de sabiduría y conexión espiritual',
    characteristics: [
      'Intuición profunda y sensibilidad',
      'Conexión con lo místico y espiritual',
      'Naturaleza reflexiva y contemplativa',
      'Capacidad de transformación interior',
      'Búsqueda constante de significado',
    ],
    strengths: [
      'Intuición y percepción psíquica',
      'Profundidad emocional y espiritual',
      'Capacidad de introspección',
      'Conexión con lo sagrado',
      'Sabiduría interior y guía',
    ],
    challenges: [
      'Tendencia a la melancolía',
      'Dificultad para estar presente',
      'Riesgo de aislamiento',
      'Necesidad de grounding',
      'Balance entre lo espiritual y lo material',
    ],
    talmudReference: 'Talmud Shabat 156b:1',
    talmudQuote: 'El que nació el sexto día de la semana será un buscador. ¿Cuál es la razón? Porque en ese día fue creado el hombre, quien busca sabiduría y comprensión.',
    zoharInsight: 'La creación del hombre en el sexto día representa la culminación de la Creación. La Luna en Yesod es el fundamento que conecta lo celestial con lo terrenal. Esta alma busca unificar todos los mundos a través de la sabiduría.',
    creationElement: 'Creación del Hombre',
  },
  6: {
    // Sábado - Saturno
    dayOfWeek: 6,
    dayName: 'Shabat',
    planet: 'Saturno',
    sefira: 'Binah (Entendimiento)',
    primaryTrait: 'Piadoso y observante, guardián del descanso',
    characteristics: [
      'Naturaleza disciplinada y estructurada',
      'Profundo respeto por la tradición',
      'Sabiduría ancestral y madurez',
      'Capacidad de restricción y límites',
      'Conexión con lo eterno',
    ],
    strengths: [
      'Disciplina y autocontrol',
      'Sabiduría profunda y madurez',
      'Respeto por lo sagrado',
      'Capacidad de enseñar tradición',
      'Estabilidad y confiabilidad',
    ],
    challenges: [
      'Rigidez y resistencia al cambio',
      'Tendencia al aislamiento',
      'Exceso de seriedad',
      'Dificultad para expresar emociones',
      'Balance entre estructura y flexibilidad',
    ],
    talmudReference: 'Talmud Shabat 156b:2',
    talmudQuote: 'El que nació en Shabat será llamado piadoso y observante. ¿Cuál es la razón? Porque en ese día el Santo, bendito sea, descansó de toda Su obra.',
    zoharInsight: 'Shabat es el día de la perfección y el descanso divino. Saturno en Binah representa el entendimiento profundo y la madre superior. El alma nacida en Shabat porta la santidad del descanso y la capacidad de conectar con lo Eterno.',
    creationElement: 'Descanso Divino',
  },
};

/**
 * Obtiene el perfil de mazal completo para un día de nacimiento
 * @param dayOfWeek Día de la semana (0-6, 0=Domingo)
 * @returns Perfil completo de mazal
 */
export function getMazalProfile(dayOfWeek: number): MazalProfile {
  return MAZAL_PROFILES[dayOfWeek] || MAZAL_PROFILES[0];
}

/**
 * Genera análisis de mazal personalizado
 * @param dayOfWeek Día de la semana de nacimiento
 * @param hebrewYear Año hebreo de nacimiento
 * @returns Análisis completo
 */
export function generateMazalAnalysis(dayOfWeek: number, hebrewYear: number) {
  const profile = getMazalProfile(dayOfWeek);
  const planetInfo = HEBREW_DAY_PLANETS[dayOfWeek as keyof typeof HEBREW_DAY_PLANETS];
  
  return {
    profile,
    planetInfo,
    summary: `Nacido en ${profile.dayName}, bajo la influencia de ${profile.planet} y la sefirá de ${profile.sefira}. ${profile.primaryTrait}.`,
    spiritualPath: generateSpiritualPath(profile),
    lifeGuidance: generateLifeGuidance(profile),
  };
}

/**
 * Genera guía espiritual basada en el perfil de mazal
 */
function generateSpiritualPath(profile: MazalProfile): string {
  const paths: Record<number, string> = {
    0: 'Tu camino espiritual requiere elegir conscientemente entre luz y oscuridad. Cultiva la auto-observación y la meditación para reconocer tus tendencias extremas. Busca el balance a través del estudio de Torá y la práctica de mitzvot.',
    1: 'Tu desafío espiritual es transformar el fuego de Guevurah en fuerza constructiva. Practica la paciencia y la respiración consciente. Estudia las enseñanzas sobre el control del temperamento y canaliza tu energía en causas justas.',
    2: 'Tu abundancia es un regalo divino que debe ser canalizado con sabiduría. Practica la tzedaká (caridad) y establece límites claros. Cultiva la belleza interior a través del estudio y la contemplación de la armonía divina.',
    3: 'Tu sabiduría debe ser compartida con humildad. Dedica tiempo al estudio profundo de textos sagrados y a la enseñanza. Recuerda que la verdadera sabiduría incluye el reconocimiento de lo que no sabes.',
    4: 'Tu bondad natural es tu mayor fortaleza. Asegúrate de incluirte en tu círculo de compasión. Practica el servicio consciente y establece límites saludables. Tu comunicación puede sanar y elevar a otros.',
    5: 'Tu búsqueda espiritual es profunda y genuina. Dedica tiempo a la meditación y la contemplación. Estudia Cabalá y misticismo judío. Recuerda mantener los pies en la tierra mientras exploras los cielos.',
    6: 'Tu conexión con lo sagrado es natural. Honra el Shabat y las tradiciones ancestrales. Comparte tu sabiduría con las nuevas generaciones. Permite que la alegría y la flexibilidad complementen tu disciplina.',
  };
  
  return paths[profile.dayOfWeek] || paths[0];
}

/**
 * Genera guía de vida basada en el perfil de mazal
 */
function generateLifeGuidance(profile: MazalProfile): string[] {
  return [
    `Fortaleza principal: ${profile.strengths[0]}`,
    `Desafío a trabajar: ${profile.challenges[0]}`,
    `Elemento de creación: ${profile.creationElement}`,
    `Práctica recomendada: Meditación en la sefirá de ${profile.sefira}`,
    `Estudio sugerido: ${profile.talmudReference}`,
  ];
}

/**
 * Calcula compatibilidad entre dos días de nacimiento
 * @param day1 Primer día de la semana
 * @param day2 Segundo día de la semana
 * @returns Nivel de compatibilidad y descripción
 */
export function calculateCompatibility(day1: number, day2: number) {
  const profile1 = getMazalProfile(day1);
  const profile2 = getMazalProfile(day2);
  
  // Lógica de compatibilidad basada en sefirot y planetas
  const compatibilityMatrix: Record<string, number> = {
    '0-0': 50, '0-1': 60, '0-2': 70, '0-3': 80, '0-4': 75, '0-5': 65, '0-6': 55,
    '1-1': 40, '1-2': 65, '1-3': 70, '1-4': 60, '1-5': 55, '1-6': 50,
    '2-2': 60, '2-3': 85, '2-4': 80, '2-5': 70, '2-6': 60,
    '3-3': 75, '3-4': 90, '3-5': 85, '3-6': 70,
    '4-4': 80, '4-5': 75, '4-6': 65,
    '5-5': 70, '5-6': 80,
    '6-6': 85,
  };
  
  const key = day1 <= day2 ? `${day1}-${day2}` : `${day2}-${day1}`;
  const score = compatibilityMatrix[key] || 50;
  
  return {
    score,
    description: score >= 80 ? 'Altamente compatible' : score >= 65 ? 'Compatible' : score >= 50 ? 'Moderadamente compatible' : 'Requiere trabajo',
    profile1,
    profile2,
  };
}

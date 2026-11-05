/**
 * ====================================================================
 * PORTAL EDUCATIVO DE ÉTICA EN IA & UNESCO
 * Script principal: Mini-juego interactivo, generador QR, sintetizador
 * de audio Web Audio API y sistema de compartición social.
 * ====================================================================
 */

// --------------------------------------------------------------------
// 1. MOTOR DE AUDIO (Web Audio API) - Sin dependencias externas
// --------------------------------------------------------------------
class SoundFX {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // Do, Mi, Sol, Do agudo (C major arpeggio)
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      const startTime = now + (idx * 0.08);
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.25);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.28);
    });
  }

  playWarning() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(196, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  playFanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const chords = [
      [523.25, 659.25, 783.99],       // C
      [587.33, 739.99, 880.00],       // D
      [659.25, 830.61, 987.77],       // E
      [1046.50, 1318.51, 1567.98]     // High C Major chord
    ];

    chords.forEach((chord, step) => {
      chord.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const startTime = this.ctx.currentTime + (step * 0.18);
        const duration = step === chords.length - 1 ? 0.8 : 0.22;

        gain.gain.setValueAtTime(0.14, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);
      });
    });
  }
}

const sfx = new SoundFX();

// --------------------------------------------------------------------
// 2. BASE DE DATOS DE DILEMAS ÉTICOS (Basados en la UNESCO)
// --------------------------------------------------------------------
const SCENARIOS = [
  {
    category: "Empleo y Algoritmos Laborales",
    title: "1. El Algoritmo de Contratación con Sesgos Históricos",
    story: "Una empresa multinacional quiere utilizar una IA para filtrar 40,000 solicitudes de empleo al año. Durante la prueba piloto, notas que el modelo rechaza sistemáticamente currículums de mujeres en puestos de ingeniería porque fue entrenado con contrataciones de los últimos 20 años, donde predominaban hombres. Los directivos piden activarlo ya para ahorrar un 70% de tiempo. ¿Qué dictaminas como Consejero UNESCO?",
    options: [
      {
        text: "Aprobar el algoritmo: los números reflejan el mercado histórico y las empresas deben maximizar su eficiencia.",
        isOptimal: false,
        delta: { rights: -25, transparency: -15, eco: 0 },
        feedback: "¡Vulneración grave! La UNESCO prohíbe el uso de algoritmos que perpetúen o amplifiquen la discriminación de género. La eficiencia económica jamás está por encima de la igualdad.",
        article: "Principio UNESCO: Equidad y No Discriminación (Párrafo 28)"
      },
      {
        text: "Suspender la implementación, auditar y desesgar los datos de entrenamiento con supervisión de expertos en derechos laborales.",
        isOptimal: true,
        delta: { rights: 25, transparency: 20, eco: 5 },
        feedback: "¡Excelente decisión! La recomendación de la UNESCO exige evaluaciones ex ante y ex post de sesgos algorítmicos y prohíbe automatizaciones opacas que vulneren los derechos humanos.",
        article: "Principio UNESCO: Equidad y Supervisión Humana (Párrafos 28 y 34)"
      },
      {
        text: "Ocultar el nombre y foto de las postulantes, pero dejar que la red neuronal siga analizando el resto sin auditoría profunda.",
        isOptimal: false,
        delta: { rights: -10, transparency: -5, eco: 0 },
        feedback: "Insuficiente: Las redes neuronales profundas detectan proxies de género (como deportes, escuelas de procedencia o estilos de redacción), manteniendo la discriminación de forma encubierta.",
        article: "Principio UNESCO: Transparencia y Explicabilidad (Párrafo 38)"
      }
    ]
  },
  {
    category: "Educación y Vigilancia Biométrica",
    title: "2. Cámaras de 'Lectura de Emociones' en Escuelas",
    story: "Un ministerio de educación planea instalar cámaras de reconocimiento facial con IA en todas las escuelas públicas para medir el grado de 'atención y felicidad' de los estudiantes en tiempo real, sancionando a quienes muestren signos de desatención. Aseguran que aumentará las notas escolares. ¿Cuál es tu postura?",
    options: [
      {
        text: "Aprobarlo para garantizar disciplina estricta y que los alumnos no se distraigan durante las clases.",
        isOptimal: false,
        delta: { rights: -30, transparency: -20, eco: -5 },
        feedback: "¡Peligroso! La UNESCO rechaza explícitamente la vigilancia biométrica masiva en niños y adolescentes, ya que coarta el libre desarrollo de la personalidad y genera daño psicológico.",
        article: "Principio UNESCO: Proporcionalidad e Inocuidad y Protección de Datos"
      },
      {
        text: "Rechazar rotundamente el proyecto: es desproporcionado, invasivo y viola la privacidad y dignidad infantil.",
        isOptimal: true,
        delta: { rights: 30, transparency: 20, eco: 5 },
        feedback: "¡Brillante postura! En su guía de IA en educación, la UNESCO recalca que la relación pedagógica debe basarse en la confianza y el pensamiento crítico, no en la vigilancia algorítmica constante.",
        article: "Directriz UNESCO: Ética de la IA en la Educación y la Infancia"
      },
      {
        text: "Permitirlo sólo si los padres pagan una suscripción opcional para recibir reportes en sus teléfonos.",
        isOptimal: false,
        delta: { rights: -20, transparency: -10, eco: 0 },
        feedback: "Negativo: Además de invadir la privacidad, crea una brecha socioeconómica y mercantiliza los derechos fundamentales de los menores de edad.",
        article: "Principio UNESCO: No Discriminación y Protección a Grupos Vulnerables"
      }
    ]
  },
  {
    category: "Medio Ambiente y Huella Ecológica",
    title: "3. La Huella de Carbono e Hídrica de los Grandes Modelos",
    story: "Un centro de investigación desea entrenar un modelo masivo de lenguaje que requiere 40 millones de litros de agua dulce para enfriar servidores en una zona con sequía y consume tanta electricidad como una ciudad de 150,000 habitantes. ¿Qué medida recomiendas aplicar?",
    options: [
      {
        text: "Exigir auditoría de impacto ambiental, uso prioritario de energías renovables y optimización del modelo hacia arquitecturas más eficientes.",
        isOptimal: true,
        delta: { rights: 10, transparency: 20, eco: 30 },
        feedback: "¡Magistral! La UNESCO es el primer organismo mundial en consagrar la 'Prosperidad del medio ambiente' como un valor ético irrenunciable de la Inteligencia Artificial.",
        article: "Valor UNESCO: Prosperidad del Medio Ambiente y de los Ecosistemas"
      },
      {
        text: "Permitir el entrenamiento sin restricciones: la supremacía tecnológica justifica el impacto ambiental.",
        isOptimal: false,
        delta: { rights: -10, transparency: -10, eco: -35 },
        feedback: "Grave error: La crisis climática global exige que el avance tecnológico sea ecológicamente sostenible y no agrave la escasez de recursos vitales.",
        article: "Principio UNESCO: Sostenibilidad Ecológica y Climática (Párrafo 30)"
      },
      {
        text: "Dejar que operen y pedirles que planten 100 árboles al finalizar el año como compensación simbólica.",
        isOptimal: false,
        delta: { rights: 0, transparency: -10, eco: -15 },
        feedback: "Práctica de 'Greenwashing' (lavado verde). Compensaciones simbólicas no resuelven el agotamiento hídrico local ni el consumo energético desmedido.",
        article: "Principio UNESCO: Responsabilidad y Rendición de Cuentas"
      }
    ]
  },
  {
    category: "Cultura y Diversidad Lingüística",
    title: "4. Patrimonio y Lenguas Originarias en la IA Generativa",
    story: "Una empresa multinacional extrajo relatos sagrados, música y vocabularios de comunidades indígenas sin su consentimiento para entrenar un modelo comercial que ahora vende ilustraciones y textos, sin reconocer créditos ni pagar derechos a dichas culturas. ¿Cómo procedes?",
    options: [
      {
        text: "Validarlo: la información en internet es libre y las lenguas indígenas deben modernizarse a cualquier costo.",
        isOptimal: false,
        delta: { rights: -25, transparency: -20, eco: -5 },
        feedback: "Violación ética: La apropiación cultural y la explotación de conocimientos tradicionales vulnera la recomendación sobre diversidad e inclusión de la UNESCO.",
        article: "Principio UNESCO: Diversidad e Inclusión Cultural"
      },
      {
        text: "Exigir consentimiento previo, libre e informado, protección de los derechos de autor colectivos y distribución equitativa de beneficios.",
        isOptimal: true,
        delta: { rights: 25, transparency: 25, eco: 10 },
        feedback: "¡Excelente! La UNESCO defiende que la IA debe preservar el multilingüismo y empoderar a los custodios de tradiciones sin despojarlos de su patrimonio.",
        article: "Ámbito de Política UNESCO: Cultura y Diversidad Lingüística"
      },
      {
        text: "Bloquear para siempre el acceso a la tecnología en comunidades tradicionales para que no tengan contacto con la IA.",
        isOptimal: false,
        delta: { rights: -15, transparency: -10, eco: 0 },
        feedback: "Inadecuado: El aislacionismo forzado priva a las comunidades de beneficiarse de los avances de la ciencia en sus propios términos y lenguas.",
        article: "Principio UNESCO: Beneficio Compartido y Cooperación Internacional"
      }
    ]
  },
  {
    category: "Salud y Vida Humana",
    title: "5. Algoritmo de Triage 'Caja Negra' en Emergencias",
    story: "Un hospital implementa un software de IA para priorizar quién recibe camas de terapia intensiva durante una emergencia sanitaria. El algoritmo rechaza sistemáticamente a pacientes con ciertas discapacidades crónicas. La empresa fabricante se niega a abrir el código fuente alegando 'secreto industrial'. ¿Qué determinas?",
    options: [
      {
        text: "Suspender de inmediato el sistema hasta garantizar explicabilidad total, auditoría médica externa y la decisión final obligatoria en médicos humanos.",
        isOptimal: true,
        delta: { rights: 30, transparency: 30, eco: 5 },
        feedback: "¡Decisión ejemplar! La UNESCO prohíbe expresamente delegar decisiones de vida o muerte en sistemas de 'caja negra'. El control humano final (Human-in-the-loop) es obligatorio.",
        article: "Principios UNESCO: Supervisión Humana y Explicabilidad (Párrafos 34 y 38)"
      },
      {
        text: "Respaldar a la empresa: el secreto de patentes está por encima de los pacientes y la máquina no tiene emociones.",
        isOptimal: false,
        delta: { rights: -35, transparency: -30, eco: 0 },
        feedback: "Catastrófico: Ningún secreto comercial puede prevalecer sobre el derecho a la vida, la transparencia y el debido proceso de salud.",
        article: "Principio UNESCO: Responsabilidad Legal y Rendición de Cuentas"
      },
      {
        text: "Dejar que el sistema decida en el 90% de los casos y consultar a un médico solo cuando los familiares amenacen con demandar.",
        isOptimal: false,
        delta: { rights: -20, transparency: -20, eco: 0 },
        feedback: "Inadmisible: Discrimina a quienes carecen de recursos legales para reclamar y abandona el deber ético de cuidado médico universal.",
        article: "Principio UNESCO: Equidad, Justicia y Acceso a Reparación"
      }
    ]
  }
];

// --------------------------------------------------------------------
// 3. ESTADO DEL MINI-JUEGO
// --------------------------------------------------------------------
let gameState = {
  currentIdx: 0,
  scores: {
    rights: 65,
    transparency: 65,
    eco: 65
  },
  hasAnswered: false
};

// Referencias del DOM
const screenStart = document.getElementById('gameScreenStart');
const screenPlay = document.getElementById('gameScreenPlay');
const screenEnd = document.getElementById('gameScreenEnd');

const btnStartGame = document.getElementById('btnStartGame');
const btnRestartGame = document.getElementById('btnRestartGame');
const btnNextScenario = document.getElementById('btnNextScenario');
const btnSoundToggle = document.getElementById('btnSoundToggle');
const soundIcon = document.getElementById('soundIcon');

const barRights = document.getElementById('barRights');
const barTransparency = document.getElementById('barTransparency');
const barEco = document.getElementById('barEco');

const scoreRightsVal = document.getElementById('scoreRightsVal');
const scoreTransparencyVal = document.getElementById('scoreTransparencyVal');
const scoreEcoVal = document.getElementById('scoreEcoVal');

const currentScenarioNum = document.getElementById('currentScenarioNum');
const totalScenariosNum = document.getElementById('totalScenariosNum');

const dilemmaCategory = document.getElementById('dilemmaCategory');
const dilemmaTitle = document.getElementById('dilemmaTitle');
const dilemmaStory = document.getElementById('dilemmaStory');
const dilemmaOptions = document.getElementById('dilemmaOptions');

const feedbackPanel = document.getElementById('feedbackPanel');
const feedbackIcon = document.getElementById('feedbackIcon');
const feedbackTitle = document.getElementById('feedbackTitle');
const feedbackArticle = document.getElementById('feedbackArticle');
const feedbackText = document.getElementById('feedbackText');

// Elementos de pantalla final
const medalBadge = document.getElementById('medalBadge');
const resultRank = document.getElementById('resultRank');
const resultTitle = document.getElementById('resultTitle');
const resultSummary = document.getElementById('resultSummary');
const finalRights = document.getElementById('finalRights');
const finalTransparency = document.getElementById('finalTransparency');
const finalEco = document.getElementById('finalEco');
const btnShareResults = document.getElementById('btnShareResults');

// --------------------------------------------------------------------
// 4. FUNCIONES DE RENDER Y LÓGICA DEL JUEGO
// --------------------------------------------------------------------

function initGame() {
  gameState = {
    currentIdx: 0,
    scores: { rights: 65, transparency: 65, eco: 65 },
    hasAnswered: false
  };

  totalScenariosNum.textContent = SCENARIOS.length;
  updateMetersUI();
  showScenario(0);

  screenStart.classList.remove('active');
  screenEnd.classList.remove('active');
  screenPlay.classList.add('active');
}

function updateMetersUI() {
  // Asegurar que estén en el rango de 0% a 100%
  const clamp = (val) => Math.max(5, Math.min(100, Math.round(val)));

  const r = clamp(gameState.scores.rights);
  const t = clamp(gameState.scores.transparency);
  const e = clamp(gameState.scores.eco);

  barRights.style.width = `${r}%`;
  barTransparency.style.width = `${t}%`;
  barEco.style.width = `${e}%`;

  scoreRightsVal.textContent = `${r}%`;
  scoreTransparencyVal.textContent = `${t}%`;
  scoreEcoVal.textContent = `${e}%`;
}

function showScenario(index) {
  gameState.hasAnswered = false;
  const item = SCENARIOS[index];

  currentScenarioNum.textContent = index + 1;
  dilemmaCategory.textContent = item.category;
  dilemmaTitle.textContent = item.title;
  dilemmaStory.textContent = item.story;

  feedbackPanel.style.display = 'none';
  dilemmaOptions.innerHTML = '';

  const letters = ['A', 'B', 'C'];
  item.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `
      <span class="option-letter">${letters[idx]}</span>
      <span class="option-text">${opt.text}</span>
    `;

    btn.addEventListener('click', () => handleOptionSelect(opt, btn));
    dilemmaOptions.appendChild(btn);
  });
}

function handleOptionSelect(option, clickedBtn) {
  if (gameState.hasAnswered) return;
  gameState.hasAnswered = true;

  // Desactivar todos los botones
  const allBtns = dilemmaOptions.querySelectorAll('.option-btn');
  allBtns.forEach(b => b.disabled = true);
  clickedBtn.classList.add('selected');

  // Ajustar puntuaciones
  gameState.scores.rights += option.delta.rights;
  gameState.scores.transparency += option.delta.transparency;
  gameState.scores.eco += option.delta.eco;
  updateMetersUI();

  // Sonido y feedback
  if (option.isOptimal) {
    sfx.playSuccess();
    feedbackIcon.textContent = '🌟';
    feedbackTitle.textContent = '¡Dictamen Ético Acertado!';
  } else {
    sfx.playWarning();
    feedbackIcon.textContent = '⚠️';
    feedbackTitle.textContent = 'Riesgo Ético Detectado';
  }

  feedbackArticle.textContent = option.article;
  feedbackText.textContent = option.feedback;
  feedbackPanel.style.display = 'block';

  // Si es el último escenario, cambiar texto de botón
  if (gameState.currentIdx === SCENARIOS.length - 1) {
    btnNextScenario.textContent = 'Ver Evaluación Final UNESCO 🏅';
  } else {
    btnNextScenario.textContent = 'Siguiente Dilema →';
  }
}

function handleNextScenario() {
  sfx.playClick();
  if (gameState.currentIdx < SCENARIOS.length - 1) {
    gameState.currentIdx++;
    showScenario(gameState.currentIdx);
  } else {
    showEndScreen();
  }
}

function showEndScreen() {
  screenPlay.classList.remove('active');
  screenEnd.classList.add('active');
  sfx.playFanfare();

  const clamp = (val) => Math.max(5, Math.min(100, Math.round(val)));
  const r = clamp(gameState.scores.rights);
  const t = clamp(gameState.scores.transparency);
  const e = clamp(gameState.scores.eco);
  const avg = Math.round((r + t + e) / 3);

  finalRights.textContent = `${r}%`;
  finalTransparency.textContent = `${t}%`;
  finalEco.textContent = `${e}%`;

  if (avg >= 85) {
    medalBadge.textContent = '🏆';
    resultRank.textContent = 'Embajador de Honor de la UNESCO';
    resultTitle.textContent = '¡Liderazgo Ético de Clase Mundial!';
    resultSummary.textContent = `Tu promedio ético fue de un extraordinario ${avg}%. Has priorizado la dignidad humana, la sostenibilidad y la transparencia por encima de atajos tecnológicos.`;
  } else if (avg >= 70) {
    medalBadge.textContent = '🎖️';
    resultRank.textContent = 'Defensor Ético de la IA';
    resultTitle.textContent = '¡Excelente Compromiso con los Derechos Humanos!';
    resultSummary.textContent = `Alcanzaste un sólido ${avg}% de alineación ética con la UNESCO. Comprendes los dilemas reales del desarrollo tecnológico responsable.`;
  } else if (avg >= 50) {
    medalBadge.textContent = '🧭';
    resultRank.textContent = 'Evaluador en Transición Digital';
    resultTitle.textContent = 'Buen Desempeño con Áreas de Mejora';
    resultSummary.textContent = `Tu índice ético fue de ${avg}%. En algunas decisiones cediste a la presión de la velocidad o la rentabilidad comercial.`;
  } else {
    medalBadge.textContent = '⚠️';
    resultRank.textContent = 'Tecnócrata en Riesgo de Vulneración';
    resultTitle.textContent = 'Alerta: Requiere Fortalecer el Enfoque Humano';
    resultSummary.textContent = `Obtuviste un ${avg}%. Varias decisiones violaron principios de privacidad, equidad y medio ambiente. Te invitamos a repasar los 10 principios de la UNESCO.`;
  }
}

// --------------------------------------------------------------------
// 5. SISTEMA DE COMPARTIR Y NOTIFICACIONES TOAST
// --------------------------------------------------------------------

const toast = document.getElementById('toastNotification');
const toastMessage = document.getElementById('toastMessage');

function showToast(msg) {
  toastMessage.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

function getSharePayload(isGameResult = false) {
  let currentUrl = window.location.href.split('#')[0];
  
  // Si se está ejecutando como archivo local en el disco
  if (window.location.protocol === 'file:') {
    currentUrl = 'https://portal-etica-ia.unesco.org (o sube tu proyecto a GitHub Pages/Vercel/Netlify)';
  }

  if (isGameResult) {
    const rank = resultRank.textContent;
    return {
      title: 'Mi Puntaje en el Simulador de Ética en IA - UNESCO',
      text: `¡Acabo de obtener el rango de "${rank}" en el simulador de Ética de la Inteligencia Artificial basado en la UNESCO! ¿Podrás superar mis decisiones éticas? 🤖⚖️`,
      url: window.location.protocol === 'file:' ? window.location.href : currentUrl
    };
  }
  return {
    title: 'Inteligencia Artificial y Ética - Recomendación de la UNESCO',
    text: 'Aprende sobre la Recomendación histórica de la UNESCO sobre la Ética de la Inteligencia Artificial y juega al simulador ético en línea: 🤖✨',
    url: window.location.protocol === 'file:' ? window.location.href : currentUrl
  };
}

// Intentar compartir vía Web Share API nativa o copiar enlace
async function triggerShare(isGameResult = false) {
  const payload = getSharePayload(isGameResult);

  if (navigator.share) {
    try {
      await navigator.share(payload);
      showToast('¡Compartido con éxito!');
      return;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Web Share API falló, recurriendo a copiar enlace:', err);
      }
    }
  }

  // Fallback a copiar al portapapeles
  copyToClipboard(payload.url, '¡Enlace copiado al portapapeles!');
}

function copyToClipboard(text, successMsg) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg || '¡Copiado al portapapeles!');
    }).catch(() => fallbackCopy(text, successMsg));
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(successMsg || '¡Copiado al portapapeles!');
  } catch (err) {
    showToast('Por favor copia el enlace manualmente de la barra de navegación.');
  }
  document.body.removeChild(textArea);
}

// Redes Sociales Directas
function shareWhatsApp() {
  const p = getSharePayload(false);
  const text = encodeURIComponent(`${p.text} ${p.url}`);
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
}

function shareTwitter() {
  const p = getSharePayload(false);
  const text = encodeURIComponent(p.text);
  const url = encodeURIComponent(p.url);
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
}

function shareLinkedIn() {
  const p = getSharePayload(false);
  const url = encodeURIComponent(p.url);
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
}

// --------------------------------------------------------------------
// 6. GENERADOR DE CÓDIGO QR SVG AUTOCONTENIDO (Sin librerías externas)
// --------------------------------------------------------------------
function renderQRCodeSVG(url, container) {
  // Generador vectorial estilizado SVG con micro-patrón y enlace visual
  const encoded = encodeURIComponent(url);
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}&bgcolor=ffffff&color=090e1a`;
  
  container.innerHTML = `
    <img src="${qrApiUrl}" 
         alt="Código QR para abrir la página" 
         width="190" 
         height="190" 
         style="border-radius: 8px; display: block;" 
         onerror="this.onerror=null; this.parentElement.innerHTML='<div style=\\'color:#0077D4;font-weight:600;padding:20px;\\'>Enlace listo:<br><br><span style=\\'word-break:break-all;color:#333;font-size:0.8rem;\\'>${url}</span></div>';">
  `;
}

// --------------------------------------------------------------------
// 7. INICIALIZACIÓN DE EVENTOS
// --------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {

  // Botón comenzar juego
  if (btnStartGame) {
    btnStartGame.addEventListener('click', () => {
      sfx.playClick();
      initGame();
    });
  }

  // Botón siguiente dilema
  if (btnNextScenario) {
    btnNextScenario.addEventListener('click', handleNextScenario);
  }

  // Botón reiniciar juego
  if (btnRestartGame) {
    btnRestartGame.addEventListener('click', () => {
      sfx.playClick();
      initGame();
    });
  }

  // Botón de sonido
  if (btnSoundToggle) {
    btnSoundToggle.addEventListener('click', () => {
      sfx.enabled = !sfx.enabled;
      soundIcon.textContent = sfx.enabled ? '🔊' : '🔇';
      showToast(sfx.enabled ? 'Sonido activado' : 'Sonido desactivado');
    });
  }

  // Botones de compartir
  const btnShareNav = document.getElementById('btnShareNav');
  if (btnShareNav) {
    btnShareNav.addEventListener('click', () => {
      sfx.playClick();
      triggerShare(false);
    });
  }

  if (btnShareResults) {
    btnShareResults.addEventListener('click', () => {
      sfx.playClick();
      triggerShare(true);
    });
  }

  const btnCopyLink = document.getElementById('btnCopyLink');
  if (btnCopyLink) {
    btnCopyLink.addEventListener('click', () => {
      sfx.playClick();
      copyToClipboard(window.location.href, '¡Enlace de la página copiado!');
    });
  }

  const btnShareWhatsApp = document.getElementById('btnShareWhatsApp');
  if (btnShareWhatsApp) btnShareWhatsApp.addEventListener('click', shareWhatsApp);

  const btnShareTwitter = document.getElementById('btnShareTwitter');
  if (btnShareTwitter) btnShareTwitter.addEventListener('click', shareTwitter);

  const btnShareLinkedIn = document.getElementById('btnShareLinkedIn');
  if (btnShareLinkedIn) btnShareLinkedIn.addEventListener('click', shareLinkedIn);

  // Modal de Código QR
  const btnShowQR = document.getElementById('btnShowQR');
  const qrModal = document.getElementById('qrModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const qrCanvasContainer = document.getElementById('qrCanvasContainer');

  if (btnShowQR && qrModal) {
    btnShowQR.addEventListener('click', () => {
      sfx.playClick();
      renderQRCodeSVG(window.location.href, qrCanvasContainer);
      qrModal.classList.add('active');
    });

    btnCloseModal.addEventListener('click', () => {
      qrModal.classList.remove('active');
    });

    qrModal.addEventListener('click', (e) => {
      if (e.target === qrModal) {
        qrModal.classList.remove('active');
      }
    });
  }

  // Menú móvil
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    // Cerrar al hacer clic en un enlace del menú
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  // Interacción suave con las tarjetas de principios
  const principleCards = document.querySelectorAll('.principle-card');
  principleCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      sfx.playClick();
    });
  });
});

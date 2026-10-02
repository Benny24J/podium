import type { Category, Session, SessionInput, SessionSummary, Topic } from './generated/api.schemas';

type SeedCategory = {
  name: string;
  description: string;
  topics: string[];
};

const seedCategories: SeedCategory[] = [
  {
    name: "General & Life",
    description: "Everyday questions that reward a clear point of view.",
    topics: [
      "Is money the root of happiness?",
      "Why do humans dream?",
      "The impact of social media on friendships",
      "Is multitasking a myth?",
      "Nature vs. nurture in personality",
      "The psychology of habits",
      "What makes a good leader?",
      "Is procrastination always bad?",
      "The ethics of white lies",
      "Why do we forget things?",
      "The science of first impressions",
      "Is competition healthy?",
      "What is the meaning of “success”?",
      "The impact of loneliness on health",
      "Why do people believe in luck?",
    ],
  },
  {
    name: "History",
    description: "Events, people, and turning points that shaped the present.",
    topics: [
      "The French Revolution and Marie Antoinette",
      "The history of Nigeria",
      "Alexander Hamilton and the U.S. financial system",
      "The fall of the Roman Empire",
      "The Silk Road",
      "The Cold War",
      "The Industrial Revolution",
      "Ancient Egypt and the pyramids",
      "The transatlantic slave trade",
      "The partition of India",
      "The fall of the Berlin Wall",
      "The Ottoman Empire",
      "Colonization of Africa",
      "The Renaissance in Italy",
      "World War I’s causes",
      "The Space Race",
    ],
  },
  {
    name: "Architecture",
    description: "The spaces, structures, and ideas that shape how people live.",
    topics: [
      "Gothic cathedrals",
      "The Bauhaus movement",
      "Brutalism",
      "The Seven Wonders of the Ancient World",
      "Sustainable/green architecture",
      "Skyscrapers and urban density",
      "Ancient Roman engineering",
      "Japanese minimalist design",
      "The architecture of mosques",
      "Frank Lloyd Wright’s philosophy",
      "Slum housing and urban planning",
      "Earthquake-resistant design",
    ],
  },
  {
    name: "Nutrition & Health",
    description: "Evidence, habits, and public conversations around wellbeing.",
    topics: [
      "Intermittent fasting",
      "The gut microbiome",
      "Sugar and the brain",
      "Hydration myths",
      "Processed foods and health",
      "The science of sleep",
      "Vaccines and immunity",
      "Mental health stigma",
      "The placebo effect",
      "Exercise and longevity",
      "Food deserts",
      "Plant-based diets",
    ],
  },
  {
    name: "Biology",
    description: "Living systems, adaptation, and the science of being human.",
    topics: [
      "How genes work",
      "Cell division",
      "Evolution by natural selection",
      "The human genome project",
      "Photosynthesis",
      "The immune system",
      "Viruses vs. bacteria",
      "CRISPR gene editing",
      "The human microbiome",
      "Extremophiles",
      "Animal migration",
      "Neuroplasticity",
    ],
  },
  {
    name: "Technology",
    description: "The systems and inventions changing how we work and connect.",
    topics: [
      "How AI models actually work",
      "Blockchain explained simply",
      "Quantum computing basics",
      "History of the internet",
      "Cybersecurity fundamentals",
      "Self-driving cars",
      "Social media algorithms",
      "The ethics of facial recognition",
      "3D printing",
      "Renewable energy tech",
      "Virtual reality",
      "The future of work with automation",
    ],
  },
  {
    name: "Chemistry",
    description: "The reactions and materials hiding in ordinary life.",
    topics: [
      "The periodic table’s logic",
      "Chemical bonding",
      "Why is water “wet”?",
      "Fermentation science",
      "Battery chemistry",
      "Plastics and pollution",
      "The chemistry of cooking",
      "Nuclear chemistry",
      "Acids and bases in daily life",
      "Perfume chemistry",
    ],
  },
  {
    name: "Physics",
    description: "The forces, fields, and counterintuitive rules of reality.",
    topics: [
      "Black holes",
      "Quantum mechanics for beginners",
      "Thermodynamics in daily life",
      "Einstein’s relativity",
      "How GPS works",
      "The physics of sound",
      "Nuclear fusion",
      "String theory (basics)",
      "Why the sky is blue",
      "Time dilation",
    ],
  },
  {
    name: "Astronomy & Space",
    description: "Big questions about the universe and our place in it.",
    topics: [
      "Exoplanets and the search for life",
      "The Apollo moon landing",
      "Could we colonize Mars?",
      "How stars are born",
      "The Big Bang theory",
      "Dark matter and dark energy",
      "The James Webb telescope",
      "Asteroid mining",
      "The search for extraterrestrial intelligence",
      "Life cycle of the sun",
    ],
  },
  {
    name: "Arts & Design",
    description: "Creative movements, visual language, and cultural expression.",
    topics: [
      "The Renaissance masters",
      "History of jazz",
      "Film noir",
      "Street art as protest",
      "Impressionism",
      "The evolution of animation",
      "Fashion as identity",
      "Photography as art",
      "Sculpture through the ages",
      "The business of NFTs and digital art",
    ],
  },
  {
    name: "Culture & Traditions",
    description: "Rituals and customs that carry identity across generations.",
    topics: [
      "Wedding rituals around the world",
      "How language shapes thought",
      "Food traditions and identity",
      "Coming-of-age ceremonies globally",
      "The history of tattoos",
      "Religious festivals",
      "Superstitions across cultures",
      "Etiquette differences worldwide",
      "Oral storytelling traditions",
    ],
  },
  {
    name: "Geography & Earth Science",
    description: "Landscapes, natural systems, and the forces that move the planet.",
    topics: [
      "Tectonic plates and earthquakes",
      "Great rivers of the world",
      "Desert ecosystems",
      "Climate zones explained",
      "Volcanoes",
      "Ocean currents",
      "Deforestation of the Amazon",
      "Coral reefs",
      "The world’s disappearing glaciers",
      "Migration patterns of nations",
    ],
  },
  {
    name: "Philosophy",
    description: "Questions that sharpen reasoning, values, and perspective.",
    topics: [
      "Free will vs. determinism",
      "What is justice?",
      "The trolley problem",
      "Existentialism explained",
      "Utilitarianism vs. deontology",
      "What makes something “art”?",
      "The nature of consciousness",
      "Stoicism in modern life",
      "Is morality objective?",
      "The simulation hypothesis",
    ],
  },
  {
    name: "Psychology",
    description: "The biases, behaviors, and social forces behind human choices.",
    topics: [
      "Cognitive biases",
      "The bystander effect",
      "Nature vs. nurture",
      "Attachment theory",
      "Groupthink",
      "The psychology of persuasion",
      "Imposter syndrome",
      "The Stanford Prison Experiment",
      "Emotional intelligence",
      "Memory and false memories",
    ],
  },
  {
    name: "Economics & Business",
    description: "Markets, incentives, and the decisions behind organizations.",
    topics: [
      "Inflation explained simply",
      "Supply and demand",
      "Cryptocurrency’s economic impact",
      "The gig economy",
      "Monopolies and antitrust law",
      "Universal basic income",
      "Behavioral economics",
      "Startups vs. big corporations",
      "Income inequality",
      "Globalization’s winners and losers",
    ],
  },
  {
    name: "Politics & Law",
    description: "Institutions, rights, and the debates that organize public life.",
    topics: [
      "How elections work",
      "Freedom of speech limits",
      "The separation of powers",
      "International human rights",
      "Immigration policy debates",
      "Capital punishment debates",
      "Data privacy laws",
      "Lobbying and its influence",
      "Federalism vs. centralization",
      "Civil disobedience through history",
    ],
  },
  {
    name: "Mythology & Folklore",
    description: "Stories and symbols that cultures use to explain the unknown.",
    topics: [
      "Greek mythology’s lasting influence",
      "Norse mythology",
      "African folklore and oral tradition",
      "Creation myths across cultures",
      "Dragons in world mythology",
      "The hero’s journey archetype",
      "Egyptian gods",
      "Native American legends",
    ],
  },
  {
    name: "Literature",
    description: "Stories, forms, and authors that change how people see the world.",
    topics: [
      "The rise of the novel",
      "Shakespeare’s influence on language",
      "Dystopian fiction and society",
      "Poetry as protest",
      "Banned books through history",
      "Oral epics like the Odyssey",
      "African literature’s global rise",
      "Magical realism",
    ],
  },
  {
    name: "Music",
    description: "Sound, culture, and the stories people carry through music.",
    topics: [
      "The history of hip-hop",
      "Classical music’s structure",
      "How music affects mood",
      "The evolution of Afrobeats",
      "Music piracy and streaming economics",
      "Instruments across cultures",
      "The physics of sound in music",
      "Protest songs through history",
    ],
  },
  {
    name: "Sports",
    description: "Competition, performance, identity, and the business of play.",
    topics: [
      "The business of the Olympics",
      "Doping in sports",
      "Sports and national identity",
      "The evolution of football/soccer tactics",
      "Concussions in contact sports",
      "Title IX and gender equity in sports",
      "E-sports as a legitimate sport",
    ],
  },
  {
    name: "Environment & Climate",
    description: "The choices and systems that shape a livable future.",
    topics: [
      "Climate change basics",
      "Renewable vs. fossil fuels",
      "Plastic pollution in oceans",
      "Endangered species",
      "Carbon offsets — do they work?",
      "Urban sustainability",
      "Fast fashion’s environmental cost",
    ],
  },
  {
    name: "Mathematics",
    description: "Patterns, uncertainty, and ideas that explain the world precisely.",
    topics: [
      "The Fibonacci sequence in nature",
      "Why math is called the “universal language”",
      "Probability and everyday decisions",
      "Cryptography and prime numbers",
      "Game theory",
      "Infinity as a concept",
    ],
  },
  {
    name: "Medicine & Public Health",
    description: "The science, systems, and choices behind healthier communities.",
    topics: [
      "How vaccines are developed",
      "Pandemics through history",
      "Antibiotic resistance",
      "Mental health treatment evolution",
      "Organ transplants",
      "Public health vs. individual freedom (mask/vaccine mandates)",
      "Genetic disorders",
    ],
  },
  {
    name: "Linguistics & Language",
    description: "How humans communicate, change meaning, and build connection.",
    topics: [
      "How languages evolve",
      "Endangered languages",
      "Sign language as a full language",
      "Why accents exist",
      "The origin of writing systems",
      "Bilingualism and the brain",
    ],
  },
];

const specialAngles: Record<string, string[]> = {
  "The French Revolution and Marie Antoinette": [
    "causes and inequality",
    "Marie Antoinette’s real role and reputation",
    "the Reign of Terror",
    "lasting impact on modern France",
  ],
  "How AI models actually work": [
    "training data and pattern recognition",
    "tokens, neural networks, and predictions",
    "where models hallucinate or fail",
    "what responsible use looks like",
  ],
  "Could we colonize Mars?": [
    "the engineering and travel challenge",
    "food, water, and shelter",
    "health and psychological risks",
    "whether settlement is worth the cost",
  ],
  "The psychology of habits": [
    "cue, routine, and reward",
    "why changing context matters",
    "identity-based habits",
    "designing a habit that lasts",
  ],
  "Climate change basics": [
    "the greenhouse effect",
    "evidence and attribution",
    "who is most affected",
    "solutions and tradeoffs",
  ],
};

function anglesFor(title: string, _category: string): string[] {
  if (specialAngles[title]) return specialAngles[title];
  return [
    `the key ideas behind ${title.toLowerCase()}`,
    `a surprising example or turning point in ${title.toLowerCase()}`,
    `the debate, tradeoff, or unanswered question`,
    `why ${title.toLowerCase()} still matters today`,
  ].map((angle) => angle[0].toUpperCase() + angle.slice(1));
}

// Build category and topic database in memory
export const localCategories: Category[] = [];
export const localTopics: Topic[] = [];

let nextCategoryId = 1;
let nextTopicId = 1;

for (const cat of seedCategories) {
  const catId = nextCategoryId++;
  localCategories.push({
    id: catId,
    name: cat.name,
    description: cat.description,
    topicCount: cat.topics.length,
  });

  for (const topicTitle of cat.topics) {
    const tId = nextTopicId++;
    localTopics.push({
      id: tId,
      categoryId: catId,
      categoryName: cat.name,
      title: topicTitle,
      angles: anglesFor(topicTitle, cat.name),
    });
  }
}

const STORAGE_KEY = 'podium-sessions-store';

function getStoredSessions(): Session[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredSessions(sessions: Session[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // Ignore storage quota errors
  }
}

export function handleLocalApi(path: string, options: { method?: string; body?: unknown } = {}): unknown {
  const method = (options.method || 'GET').toUpperCase();
  const urlObj = new URL(path, 'http://localhost');
  const pathname = urlObj.pathname;
  const searchParams = urlObj.searchParams;

  if (pathname === '/api/healthz') {
    return { status: 'healthy' };
  }

  if (pathname === '/api/categories') {
    return localCategories;
  }

  if (pathname === '/api/topics') {
    const categoryIdStr = searchParams.get('categoryId');
    if (categoryIdStr) {
      const catId = Number(categoryIdStr);
      return localTopics.filter((t) => t.categoryId === catId);
    }
    return localTopics;
  }

  if (pathname === '/api/topics/random') {
    const categoryIdStr = searchParams.get('categoryId');
    let pool = localTopics;
    if (categoryIdStr) {
      const catId = Number(categoryIdStr);
      pool = localTopics.filter((t) => t.categoryId === catId);
    }
    if (pool.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }

  if (pathname === '/api/sessions' && method === 'GET') {
    const sessionKey = searchParams.get('sessionKey');
    const sessions = getStoredSessions();
    if (!sessionKey) return sessions;
    return sessions.filter((s) => s.sessionKey === sessionKey);
  }

  if (pathname === '/api/sessions' && method === 'POST') {
    const body = (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) as SessionInput;
    const topic = localTopics.find((t) => t.id === body.topicId) || {
      title: 'Speaking Practice',
      categoryName: 'General',
    };

    const newSession: Session = {
      id: Date.now(),
      sessionKey: body.sessionKey,
      topicId: body.topicId,
      topicTitle: topic.title,
      categoryName: topic.categoryName,
      researchSeconds: body.researchSeconds,
      speakingSeconds: body.speakingSeconds,
      createdAt: new Date().toISOString(),
      recordingUrl: body.recordingUrl ?? null,
      transcript: body.transcript ?? null,
      fillerCount: body.fillerCount ?? null,
      fillersPerMinute: body.fillersPerMinute ?? null,
      eyeContactPercent: body.eyeContactPercent ?? null,
      postureScore: body.postureScore ?? null,
      stillnessScore: body.stillnessScore ?? null,
      visualSamples: body.visualSamples ?? null,
      feedbackSummary: body.feedbackSummary ?? null,
      feedbackStrengths: body.feedbackStrengths ?? [],
      feedbackImprovements: body.feedbackImprovements ?? [],
      feedbackNextTip: body.feedbackNextTip ?? null,
    };

    const existing = getStoredSessions();
    const updated = [newSession, ...existing];
    saveStoredSessions(updated);
    return newSession;
  }

  if (pathname === '/api/sessions/summary') {
    const sessionKey = searchParams.get('sessionKey');
    const sessions = getStoredSessions().filter((s) => !sessionKey || s.sessionKey === sessionKey);
    
    let totalSpeakingSeconds = 0;
    let totalResearchSeconds = 0;
    const categoryCounts: Record<string, number> = {};

    for (const session of sessions) {
      totalSpeakingSeconds += session.speakingSeconds || 0;
      totalResearchSeconds += session.researchSeconds || 0;
      if (session.categoryName) {
        categoryCounts[session.categoryName] = (categoryCounts[session.categoryName] || 0) + 1;
      }
    }

    let favoriteCategory: string | null = null;
    let maxCount = 0;
    for (const [cat, count] of Object.entries(categoryCounts)) {
      if (count > maxCount) {
        maxCount = count;
        favoriteCategory = cat;
      }
    }

    const summary: SessionSummary = {
      sessionCount: sessions.length,
      totalSpeakingSeconds,
      totalResearchSeconds,
      favoriteCategory,
    };

    return summary;
  }

  return null;
}

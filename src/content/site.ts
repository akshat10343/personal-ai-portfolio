/**
 * All site content lives here — edit this file, not the components.
 *
 * Sourcing notes:
 *  - Content is drawn from Akshat's real resumes (July 2026) and public GitHub.
 *  - ⚠️ DISCLOSURE: Bell Labs internship items are intentionally genericized
 *    (no internal dataset names / phase terms). Get manager sign-off on the
 *    metrics below before deploying this site publicly.
 *  - Unverified "yellow" resume items (SQL, TypeScript, XGBoost, RAG, etc.)
 *    are deliberately excluded until confirmed.
 */

export const identity = {
  name: "Akshat Kansal",
  monogram: "AK",
  role: "AI/ML Research Intern @ Nokia Bell Labs",
  location: "Seattle, WA",
  email: "ak10343@uw.edu",
  github: "https://github.com/akshat10343",
  linkedin: "https://linkedin.com/in/akshatUW",
  availability: "Open to Summer 2027 internships",
  /** Set to e.g. "/Akshat_Kansal_Resume.pdf" once the corrected PDF is in public/. */
  resumeUrl: null as string | null,
  tagline: "I build intelligent systems that actually ship.",
  sub: "CS undergrad at the University of Washington. Currently doing AI/ML research at Nokia Bell Labs: hunting data leakage, training intrusion detectors, and turning research code into reproducible pipelines.",
};

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Experiments", href: "#experiments" },
  { label: "Writing", href: "#writing" },
  { label: "Skills", href: "#skills" },
  { label: "Goals", href: "#goals" },
  { label: "Contact", href: "#contact" },
];

export type Experience = {
  role: string;
  org: string;
  period: string;
  points: string[];
};

export const experience: Experience[] = [
  {
    role: "AI/ML Research Intern",
    org: "Nokia Bell Labs",
    period: "Jun 2026 – Aug 2026",
    points: [
      "Intrusion-detection research: two public benchmarks audited for label leakage, three model families compared under one frozen protocol, PR-AUC 0.995 at best.",
    ],
  },
  {
    role: "Founding Member & Technical Lead",
    org: "Tomshield (early-stage startup)",
    period: "Nov 2024 – Jan 2026",
    points: [
      "Built an AI-driven insurance-verification platform for leasing and finance companies; grew it to ~600 users.",
      "Dockerized Java microservices on AWS Fargate with Jenkins CI/CD.",
    ],
  },
  {
    role: "Undergraduate Coding Assistant (TA)",
    org: "University of Washington",
    period: "Jan 2025 – Present",
    points: [
      "Teach programming fundamentals and data structures (CSS 142/143) to ~30 students a quarter.",
    ],
  },
  {
    role: "President",
    org: "Trickfire Robotics",
    period: "Dec 2024 – Present",
    points: [
      "Lead a 150+ member robotics organization across 5 engineering sub-teams.",
    ],
  },
  {
    role: "Founder & President",
    org: "Eco Car Club",
    period: "Mar 2025 – Present",
    points: [
      "Founded the club, recruited 60+ members, and run weekly hands-on design workshops.",
    ],
  },
  {
    role: "Software Engineering Intern",
    org: "Pacific Northwest Chess Center",
    period: "Jun 2023 – Jan 2024",
    points: [
      "Built workflow automation for tournament check-in and board setup used across 15+ events, cutting average wait times by 35%.",
    ],
  },
];

/** Typed into the hero terminal, line by line. */
export const terminalLines = [
  { text: "$ mini-llm-serve --device cpu", kind: "cmd" },
  { text: "▸ loading TinyLlama-1.1B … pinned revision, 1.1B params ✓", kind: "out" },
  { text: "▸ scratch forward pass: max logit error vs HF = 0.0", kind: "out" },
  { text: "  KV cache warm · decode 11.3× faster than uncached", kind: "dim" },
  { text: "▸ continuous batching: 4 slots, admitting requests …", kind: "out" },
  { text: "✓ serving on :8000 → BENCHMARKS.md", kind: "ok" },
  { text: "$", kind: "prompt" },
] as const;

export const about = {
  heading: "Research-grade curiosity, production-grade habits.",
  paragraphs: [
    "I'm a computer science student at the University of Washington (B.S. expected May 2028, 3.87 GPA, Dean's List every quarter) who likes hard problems with messy data and real stakes.",
    "This summer I'm an AI/ML research intern at Nokia Bell Labs, building a machine-learning pipeline for network intrusion detection. It's the unglamorous-but-critical work of auditing datasets for leakage, pinning data integrity, and making every result reproducible from a single command.",
    "Outside of research I teach: as a TA I walk ~30 students a quarter through programming fundamentals and data structures. And I lead: I'm president of Trickfire Robotics (150+ members across 5 engineering sub-teams) and founded the Eco Car Club (60+ members).",
  ],
  stats: [
    { value: "3.87", label: "GPA at UW" },
    { value: "150+", label: "engineers led at Trickfire" },
    { value: "~600", label: "users on a platform I co-built" },
    { value: "30", label: "students mentored / quarter" },
  ],
};

export type Project = {
  id: string;
  title: string;
  org?: string;
  period: string;
  summary: string;
  bullets: string[];
  tech: string[];
  href?: string;
  featured?: boolean;
  note?: string;
  /** Long-form content for the case-study modal. */
  details?: {
    problem: string;
    approach: string[];
    learned: string;
  };
  /** Headline metrics shown in the case-study hero band. */
  heroStats?: Array<[string, string]>;
  /** Animated charts inside the case study. Values must be real. */
  charts?: Array<{
    title: string;
    note?: string;
    min?: number;
    max: number;
    bars: Array<{
      label: string;
      value: number;
      display: string;
      accent?: boolean;
    }>;
  }>;
  /**
   * Screenshots for the case-study gallery. Drop images in public/projects/
   * and add entries like { src: "/projects/solarsave-1.png", caption: "..." }.
   */
  gallery?: Array<{ src: string; caption: string }>;
};

export const projects: Project[] = [
  {
    id: "mini-llm",
    title: "Mini LLM Inference Engine",
    org: "Independent project",
    period: "Jul 2026",
    summary:
      "A correctness-first TinyLlama inference engine built from raw PyTorch: manual Llama forward pass, slot-based KV cache, continuous batching, INT8 quantization, and a FastAPI serving layer. No vLLM, no llama.cpp.",
    bullets: [
      "Implemented the complete TinyLlama-1.1B forward pass in raw PyTorch (RMSNorm, RoPE, grouped-query attention, SwiGLU), loading the real 1.1B-parameter checkpoint with 0.0 max logit error against the Hugging Face reference.",
      "Built a preallocated, slot-based KV cache with generation-stamped handles: decode throughput improved 11.3× over the uncached scratch loop and landed within 3.1% of Hugging Face generate().",
      "Wrote a continuous-batching scheduler (dynamic admission, separate prefill and decode microbatches, variable-length masks): 4.63× the batch-1 throughput on the same 17-request workload, with median time-to-first-token cut in half.",
      "Added portable per-channel INT8 weight-only quantization across all 155 linear layers: 46.9% smaller model tensors at 100% teacher-forced top-1 agreement, with the 83.3% decode slowdown of the unfused path reported honestly instead of hidden.",
      "Gated every phase with correctness tests against full recomputation or the HF reference, and ran every benchmark in a fresh process against a pinned model revision.",
    ],
    tech: ["PyTorch", "Python", "FastAPI", "safetensors", "pytest"],
    href: "https://github.com/akshat10343/mini-llm-engine",
    featured: true,
    note: "Every number is from checked-in benchmark runs on an Apple M2 CPU.",
    details: {
      problem:
        "Production LLM serving engines like vLLM are black boxes stacked on black boxes. The only way to genuinely understand why a KV cache, continuous batching, and quantization dominate serving economics is to build them from raw tensor operations and prove each one correct.",
      approach: [
        "Wrote the full Llama decoder in raw PyTorch: FP32 RMSNorm variance, split-half RoPE, 32 query heads sharing 4 K/V heads, SwiGLU MLP. The real safetensors checkpoint loads strictly, and scratch logits match HF eager attention exactly.",
        "Designed a static KV cache laid out per layer as [max requests, kv heads, max length, head dim], costing exactly 22 KiB per cached token per request. Generation-stamped handles make a released slot unreadable through a stale handle.",
        "Built continuous batching the way real engines do it: decode all active requests each step, release finished ones, admit queued requests into freed slots, and prefill newcomers in a separate right-padded microbatch.",
        "Benchmarked honestly: capacity 4 is this laptop's sweet spot at 4.63× batch-1 throughput, capacity 16 collapses below batch 1. Fits-in-memory is not a batch-size policy.",
        "Quantized every linear layer to symmetric per-channel INT8: 1.885× storage compression, logit cosine similarity 0.99907, perplexity +3.48%. The portable path decodes 83.3% slower because dequantization is not fused, and the report treats that as data, not something to hide.",
        "Served it all through FastAPI with a background scheduler worker, so concurrent HTTP requests are admitted mid-flight between decode iterations.",
      ],
      learned:
        "Serving optimizations only count when a correctness gate proves the tokens didn't change. And a negative result reported precisely is worth more than a vague win.",
    },
    heroStats: [
      ["11.3×", "decode speedup from the KV cache"],
      ["4.63×", "throughput at batch capacity 4"],
      ["46.9%", "model storage cut by INT8"],
    ],
    charts: [
      {
        title: "Decode throughput by stage · tokens/s on an Apple M2 CPU",
        max: 15,
        bars: [
          { label: "HF generate() baseline", value: 13.24, display: "13.24" },
          { label: "scratch, no cache", value: 1.21, display: "1.21" },
          { label: "scratch + KV cache", value: 13.65, display: "13.65", accent: true },
          { label: "scratch + portable INT8", value: 2.28, display: "2.28" },
        ],
      },
      {
        title: "Output tokens/s by batch capacity · same 17-request workload",
        note: "capacity 16 collapses below batch 1: padding saturates the CPU",
        max: 4,
        bars: [
          { label: "capacity 1", value: 0.79, display: "0.79" },
          { label: "capacity 4", value: 3.66, display: "3.66", accent: true },
          { label: "capacity 8", value: 2.88, display: "2.88" },
          { label: "capacity 16", value: 0.76, display: "0.76" },
        ],
      },
      {
        title: "Exact model-tensor storage · GB",
        max: 2.5,
        bars: [
          { label: "BF16 checkpoint", value: 2.2, display: "2.20 GB" },
          { label: "INT8 + FP32 scales", value: 1.17, display: "1.17 GB", accent: true },
        ],
      },
    ],
  },
  {
    id: "tomshield",
    title: "Tomshield",
    org: "Early-stage startup · Founding Member & Technical Lead",
    period: "Nov 2024 – Jan 2026",
    summary:
      "An AI-driven asset-protection platform that automates insurance-coverage verification for leasing and finance companies. Grew to ~600 users.",
    bullets: [
      "Shipped Dockerized Java microservices on AWS Fargate with Jenkins CI/CD and automated testing (JUnit, Selenium).",
      "Owned technical direction as a founding member, from architecture to deployment.",
    ],
    tech: ["Java", "Docker", "AWS Fargate", "Jenkins", "JUnit"],
    details: {
      problem:
        "Leasing and finance companies verify insurance coverage from lessees and borrowers by hand: slow, error-prone, and expensive at any real volume.",
      approach: [
        "Co-founded the platform and owned technical direction from architecture through deployment as Technical Lead.",
        "Shipped Dockerized Java microservices on AWS Fargate, with Jenkins CI/CD keeping releases boring.",
        "Automated testing with JUnit and Selenium so a two-person engineering effort could ship with confidence.",
        "Grew the platform to roughly 600 users before the startup wound down in early 2026.",
      ],
      learned:
        "Founding-team engineering means owning everything from system design to support, and shipping something real beats polishing something imaginary.",
    },
    heroStats: [["~600", "users at peak"]],
  },
  {
    id: "nlp-finance",
    title: "NLP for Finance",
    org: "Independent project",
    period: "Jun – Sep 2025",
    summary:
      "A three-stage financial-text classifier: classical ML vs. LSTM vs. fine-tuned BERT, benchmarked head-to-head.",
    bullets: [
      "Fine-tuned BertForSequenceClassification (AdamW, linear warm-up) to 96.9% test accuracy.",
      "Built the full NLP preprocessing workflow (NLTK tokenization, lemmatization, stop-word filtering) plus multi-label confusion-matrix evaluation.",
    ],
    tech: ["PyTorch", "Hugging Face", "Keras", "NLTK", "scikit-learn"],
    href: "https://github.com/akshat10343/NLP-for-Finance",
    details: {
      problem:
        "Three generations of NLP claim to understand financial text: classical ML, recurrent networks, and transformers. Which one actually earns its compute?",
      approach: [
        "Benchmarked bag-of-words + logistic regression, a Keras LSTM, and a fine-tuned BERT transformer head-to-head on the same financial-text task.",
        "Fine-tuned BertForSequenceClassification with AdamW and linear warm-up scheduling to 96.9% test accuracy.",
        "Built the full preprocessing workflow (NLTK tokenization, lemmatization, stop-word filtering) and evaluated with multi-label confusion matrices.",
      ],
      learned:
        "Baselines first, always: logistic regression put up a genuine fight, and beating it honestly is the only yardstick that means anything.",
    },
    heroStats: [["96.9%", "BERT test accuracy"]],
  },
  {
    id: "solarsave",
    title: "SolarSave",
    org: "Independent project",
    period: "Jun – Aug 2024",
    summary:
      "A full-stack web app that estimates solar-energy potential and financial payback from your location.",
    bullets: [
      "Express REST API integrating geocoding and solar-irradiance APIs, with input validation and rate limiting.",
      "System-sizing, tariff-handling, and payback calculations behind an interactive React UI.",
    ],
    tech: ["React", "Node.js", "Express", "REST APIs"],
    href: "https://github.com/akshat10343/SolarSave",
    details: {
      problem:
        "\"Is solar worth it for my roof?\" has a real answer, but it's buried under irradiance data, system sizing, and utility tariffs most people will never untangle.",
      approach: [
        "Built an Express REST API that integrates geocoding and solar-irradiance APIs, with input validation and rate limiting.",
        "Implemented the system-sizing, tariff-handling, and payback calculations that turn raw data into a dollar answer.",
        "Wrapped it in a responsive React UI with interactive visualizations.",
      ],
      learned:
        "API design is user experience: the frontend can only be as pleasant as the contract underneath it.",
    },
  },
  {
    id: "calorie-counter",
    title: "Calorie Counter",
    org: "Independent project",
    period: "Dec 2024 – Feb 2025",
    summary:
      "A nutrition-data tool powered by a small, honest ETL pipeline.",
    bullets: [
      "Python ETL converting messy Excel nutrition data into a normalized JSON dataset.",
      "Client-side search with multi-term matching over the cleaned data.",
    ],
    tech: ["Python", "JavaScript", "JSON"],
    href: "https://github.com/akshat10343/Calorie-Counter",
    details: {
      problem:
        "Nutrition data lives in messy spreadsheets: fine for storage, useless for quick lookups while you're actually planning meals.",
      approach: [
        "Wrote a Python ETL script that converts Excel nutrition data into a normalized JSON dataset.",
        "Built a client-side search tool with multi-term matching over the cleaned data.",
      ],
      learned:
        "Small, honest tools get used. Clean data models are what make features cheap later.",
    },
  },
];

export type Experiment = {
  code: string;
  title: string;
  status: "shipped" | "active" | "queued";
  body: string;
};

export const experiments: Experiment[] = [
  {
    code: "EXP-01",
    title: "Dataset forensics: the swapped mirror",
    status: "shipped",
    body: "The most popular public mirror of a benchmark dataset had its train and test files swapped. Row-count forensics caught it; SHA-256 pinning made sure it could never silently regress.",
  },
  {
    code: "EXP-02",
    title: "The leakage kill-list",
    status: "shipped",
    body: "Certain testbed-artifact columns let a model 'cheat' at intrusion detection without learning anything real. Found them, dropped them, and encoded the rule as a pytest data contract so it stays fixed.",
  },
  {
    code: "EXP-03",
    title: "Bag-of-words vs. LSTM vs. BERT",
    status: "shipped",
    body: "When does a transformer actually earn its compute? Benchmarked three generations of NLP on financial text. Logistic regression put up a fight; BERT won at 96.9% test accuracy.",
  },
  {
    code: "EXP-04",
    title: "Job-scout agent",
    status: "active",
    body: "An autonomous LLM agent that scans internship-posting repos daily, dedupes by posting age, and recommends which of my three tailored resumes fits each role. It notifies me only when something new matches.",
  },
  {
    code: "EXP-05",
    title: "Three models, one frozen test set",
    status: "shipped",
    body: "Decision tree vs. random forest vs. XGBoost on a 560K-row held-out split, all judged at the same operating policy. XGBoost won (PR-AUC 0.995), and the per-category breakdown exposed reconnaissance scans as everyone's blind spot.",
  },
  {
    code: "EXP-06",
    title: "Orchestrated ETL from scratch",
    status: "queued",
    body: "A weekend build: an Airflow + DuckDB pipeline over a public dataset, to take one dataset from raw dump to queryable warehouse with proper scheduling and data-quality checks.",
  },
];

export type SkillGroup = { title: string; skills: string[] };

export const skillGroups: SkillGroup[] = [
  {
    title: "Languages",
    skills: ["Python", "Java", "C++", "JavaScript", "Swift"],
  },
  {
    title: "Machine Learning",
    skills: [
      "PyTorch",
      "Hugging Face Transformers",
      "TensorFlow / Keras",
      "scikit-learn",
      "BERT",
      "LSTM",
      "pandas",
      "NumPy",
      "NLTK",
    ],
  },
  {
    title: "Web & Backend",
    skills: ["React", "Node.js", "Express", "REST APIs"],
  },
  {
    title: "Cloud & DevOps",
    skills: [
      "AWS (Fargate)",
      "Docker",
      "Jenkins CI/CD",
      "Git / GitHub",
      "Linux",
      "PyArrow / Parquet",
      "pytest",
      "JUnit",
      "Selenium",
    ],
  },
  {
    title: "Networking & Security",
    skills: [
      "BGP / OSPF routing",
      "VPN configuration",
      "VoIP",
      "Information Assurance & Cybersecurity",
    ],
  },
];

export type Goal = {
  when: string;
  title: string;
  body: string;
  placeholder?: boolean;
};

export const goals: Goal[] = [
  {
    when: "Now – Summer 2026",
    title: "Ship the research",
    body: "Finish the Bell Labs internship strong: extend the intrusion-detection work to modern large-scale traffic datasets and leave behind pipelines the team can build on.",
  },
  {
    when: "Fall 2026",
    title: "Go deeper on ML systems",
    body: "Machine-learning coursework at UW, public write-ups of my experiments, and open-source contributions to the tools I already use.",
    placeholder: true,
  },
  {
    when: "Summer 2027",
    title: "Intern where the frontier is",
    body: "An AI/ML or software internship at a frontier lab or a top-tier engineering org, working on systems where correctness and scale both matter.",
  },
  {
    when: "May 2028",
    title: "Graduate and build",
    body: "B.S. in Computer Science from UW, then full-time on AI systems people actually rely on.",
  },
];

export const contact = {
  heading: "Let's build something.",
  body: "I'm always up for talking about ML pipelines, ambitious student projects, internships, or why your dataset is probably leaking. The fastest way to reach me is email.",
  /**
   * Async form sending: create a free key at web3forms.com (needs only an
   * email), set formAction to "https://api.web3forms.com/submit" and put the
   * key in formAccessKey. Until then the form falls back to opening the
   * visitor's mail app with everything pre-filled.
   */
  formAction: null as string | null,
  formAccessKey: "",
};

export type Post = {
  slug: string;
  title: string;
  date: string;
  tag: string;
  teaser: string;
  body: string[];
};

export const posts: Post[] = [
  {
    slug: "swapped-mirror",
    title: "The benchmark had its train and test sets swapped",
    date: "Jul 2026",
    tag: "data forensics",
    teaser:
      "The most popular mirror of a classic intrusion-detection benchmark ships its files mislabeled. Row-count forensics caught it, and it taught me how little a filename deserves your trust.",
    body: [
      "Every ML pipeline starts with a download step, and every download step is a leap of faith. For my intrusion-detection project I pulled a widely-used public benchmark from its most popular mirror, the one half the tutorials link to. The files came named train and test. I almost believed them.",
      "One habit saved me: checking row counts against the dataset's original paper before doing anything else. The official train partition is documented at roughly 175K rows; the file named \"train\" had 82K. The two files were swapped. Whoever uploaded the mirror crossed the names, and every downstream user who didn't check inherited a test set twice the size of their training data, silently.",
      "The fix took one line: assign roles by row count, not by filename. Making sure it could never silently regress was the real work. The pipeline now pins each raw file's SHA-256 hash in its config and refuses to run if the bytes change. A dataset isn't an input, it's a dependency, and dependencies get version-pinned.",
      "The uncomfortable part is the counterfactual. If I'd trusted the filenames, every metric I reported would have been computed on the wrong split, and plausibly nobody would have caught it, because the numbers would still have looked fine. \"Looks fine\" is the most dangerous state a benchmark result can be in.",
      "So: before you trust a dataset, audit it like code from a stranger. Row counts, class balances, duplicate rates, hashes. Twenty minutes of paranoia buys you months of results you never have to retract.",
    ],
  },
  {
    slug: "frozen-test-set",
    title: "Three models, one frozen test set",
    date: "Jul 2026",
    tag: "methodology",
    teaser:
      "How I kept a three-model bakeoff honest: freeze the split before any decision exists, force one operating policy on everyone, and read two scoreboards that disagree on purpose.",
    body: [
      "When you benchmark three models, the quietest way to lie to yourself is to keep \"just checking\" the test set. Every peek is a decision influenced by data you promised not to use. So for my decision tree vs. random forest vs. XGBoost comparison, the test split was created once (stratified, seeded, frozen) before any modeling decision existed, and opened exactly once per model.",
      "The second honesty mechanism: one operating policy for everyone. Each model's threshold was chosen on validation data under the same rule: reach at least 95% recall with the fewest false alarms. Comparing models at their own favorite thresholds is like racing cars on different tracks.",
      "Two scoreboards, on purpose. PR-AUC measures ranking quality with no threshold at all; the false-alarm rate at the chosen operating point measures what deployment would actually cost. XGBoost won both: PR-AUC 0.995, with 96.2% detection at a 16.6% false-alarm rate on a 560K-row held-out set. But the more interesting result was where all three models agreed.",
      "They agreed on their blind spot. Per-attack-category analysis showed every model struggling with the same class: reconnaissance scans, caught only ~70% of the time, while flashier flood attacks sat at 100%. Aggregate metrics hide this completely, and a detector that misses recon is a detector that misses the quiet beginning of an intrusion.",
      "One baseline keeps everyone humble: \"flag everything\" scores 100% detection with 78.6% precision on an attack-heavy dataset. If your headline metric can't clearly beat a coin with an attitude, it isn't a headline metric. That's why detection rate never travels alone in my reports; false alarms ride shotgun.",
    ],
  },
];

/**
 * All site content lives here — edit this file, not the components.
 *
 * Sourcing notes:
 *  - Content is drawn from Akshat's resumes (Sept 2026 corrected versions) and
 *    public GitHub. Every number must trace back to one of those.
 *  - Bell Labs items are intentionally genericized (no internal dataset names
 *    or phase terms). Don't add new internship metrics without sign-off.
 *  - Tomshield describes the real stack (Node/Express/Postgres, OCR, LLM
 *    extraction, carrier APIs). The old Java/Fargate/Jenkins wording was wrong.
 */

export const identity = {
  name: "Akshat Kansal",
  location: "Seattle, WA",
  email: "ak10343@uw.edu",
  github: "https://github.com/akshat10343",
  githubHandle: "akshat10343",
  linkedin: "https://linkedin.com/in/akshatUW",
  linkedinHandle: "akshatUW",
  availability: "Open to Summer 2027 internships",
  /** Set to e.g. "/Akshat_Kansal_Resume.pdf" once the PDF is in public/. */
  resumeUrl: null as string | null,
  headline: "I build ML systems from scratch, then prove they’re correct.",
  intro:
    "Computer science at the University of Washington. This summer I was an AI/ML research intern at Nokia Bell Labs, auditing intrusion-detection benchmarks for label leakage. On my own time I wrote an LLM inference engine in raw PyTorch, with a correctness test behind every speedup.",
};

export const facts: Array<{ label: string; value: string; detail: string }> = [
  {
    label: "Education",
    value: "University of Washington",
    detail: "B.S. Computer Science · May 2028 · 3.87 GPA",
  },
  {
    label: "Most recent",
    value: "Nokia Bell Labs",
    detail: "AI/ML Research Intern · Summer 2026",
  },
  {
    label: "Looking for",
    value: "Summer 2027 internships",
    detail: "Software, ML, and systems roles",
  },
];

export const navLinks = [
  { label: "Engine", href: "#engine" },
  { label: "Play", href: "#play" },
  { label: "Research", href: "#research" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

/**
 * The scroll story's chapters. `from`/`to` are in viewport heights scrolled
 * into the story (see lib/story.ts); every number is from the benchmarks.
 */
export const storyBeats = [
  {
    id: "forward",
    from: 128,
    to: 232,
    kicker: "01 · The forward pass",
    title: "A 1.1B-parameter model, rebuilt by hand.",
    body: "TinyLlama’s 22 decoder layers in raw PyTorch: RMSNorm, RoPE, grouped-query attention, SwiGLU. It loads the real checkpoint and matches Hugging Face exactly.",
    stat: "0.0",
    statLabel: "max logit error against the Hugging Face reference",
  },
  {
    id: "cache",
    from: 262,
    to: 352,
    kicker: "02 · KV cache",
    title: "Compute each token once. Keep it.",
    body: "A preallocated, slot-based cache with generation-stamped handles, so a freed slot can’t be read through a stale handle.",
    stat: "11.3×",
    statLabel: "faster decode than the uncached loop, within 3.1% of HF generate()",
  },
  {
    id: "batch",
    from: 372,
    to: 468,
    kicker: "03 · Continuous batching",
    title: "Four requests. Nobody waits for the slowest.",
    body: "Finished requests leave between decode steps and queued ones take their slot. Prefill and decode run as separate microbatches.",
    stat: "4.63×",
    statLabel: "the batch-1 throughput on the same 17-request workload",
  },
  {
    id: "int8",
    from: 492,
    to: 596,
    kicker: "04 · INT8 quantization",
    title: "Half the size. Same answers.",
    body: "Per-channel INT8 weights across all 155 linear layers, with 100% top-1 agreement. The unfused path decodes 83.3% slower, and the benchmarks say so.",
    stat: "46.9%",
    statLabel: "smaller model tensors",
  },
];

export type Bar = { label: string; value: number; display: string; accent?: boolean };

export type Chart = {
  title: string;
  unit: string;
  note?: string;
  max: number;
  bars: Bar[];
};

export type Project = {
  id: string;
  title: string;
  kind: string;
  period: string;
  summary: string;
  bullets: string[];
  tech: string[];
  href?: string;
  details?: {
    problem: string;
    approach: string[];
    learned: string;
  };
};

export const featured: Project & {
  note: string;
  stats: Array<{ value: string; label: string }>;
  charts: Chart[];
} = {
  id: "mini-llm",
  title: "Mini LLM Inference Engine",
  kind: "Independent project",
  period: "Jul 2026",
  summary:
    "TinyLlama-1.1B served from raw PyTorch: a hand-written Llama forward pass, a slot-based KV cache, continuous batching, INT8 quantization, and a FastAPI server. No vLLM, no llama.cpp.",
  bullets: [
    "Implemented the full forward pass (RMSNorm, RoPE, grouped-query attention, SwiGLU) and loaded the real 1.1B-parameter checkpoint with 0.0 max logit error against the Hugging Face reference.",
    "Built a preallocated, slot-based KV cache with generation-stamped handles. Decode got 11.3× faster than the uncached loop and landed within 3.1% of Hugging Face generate().",
    "Wrote a continuous-batching scheduler with dynamic admission and separate prefill and decode microbatches: 4.63× the batch-1 throughput on a 17-request workload, with median time-to-first-token cut in half.",
    "Added per-channel INT8 weight-only quantization across all 155 linear layers: 46.9% smaller model tensors at 100% top-1 agreement. The unfused path decodes 83.3% slower, and the benchmarks report that instead of hiding it.",
    "Gated every phase with correctness tests against full recomputation or the HF reference, and ran each benchmark in a fresh process against a pinned model revision.",
  ],
  tech: ["PyTorch", "Python", "FastAPI", "safetensors", "pytest"],
  href: "https://github.com/akshat10343/mini-llm-engine",
  note: "All numbers come from checked-in benchmark runs on an Apple M2 CPU.",
  stats: [
    { value: "11.3×", label: "faster decode with the KV cache" },
    { value: "4.63×", label: "throughput from continuous batching" },
    { value: "46.9%", label: "smaller model with INT8 weights" },
  ],
  charts: [
    {
      title: "Decode throughput by stage",
      unit: "tokens/s",
      max: 15,
      bars: [
        { label: "HF generate()", value: 13.24, display: "13.24" },
        { label: "Scratch, no cache", value: 1.21, display: "1.21" },
        { label: "Scratch + KV cache", value: 13.65, display: "13.65", accent: true },
        { label: "Scratch + INT8", value: 2.28, display: "2.28" },
      ],
    },
    {
      title: "Throughput by batch capacity",
      unit: "output tokens/s, same 17-request workload",
      note: "Capacity 16 falls below batch 1: padding saturates the CPU.",
      max: 4,
      bars: [
        { label: "Capacity 1", value: 0.79, display: "0.79" },
        { label: "Capacity 4", value: 3.66, display: "3.66", accent: true },
        { label: "Capacity 8", value: 2.88, display: "2.88" },
        { label: "Capacity 16", value: 0.76, display: "0.76" },
      ],
    },
    {
      title: "Model tensor storage",
      unit: "GB",
      max: 2.5,
      bars: [
        { label: "BF16 checkpoint", value: 2.2, display: "2.20" },
        { label: "INT8 + FP32 scales", value: 1.17, display: "1.17", accent: true },
      ],
    },
  ],
  details: {
    problem:
      "Serving engines like vLLM are black boxes stacked on black boxes. The only way to really understand why a KV cache, continuous batching, and quantization dominate serving cost is to build each one from tensor operations and prove it correct.",
    approach: [
      "The Llama decoder is written out by hand: FP32 RMSNorm variance, split-half RoPE, 32 query heads sharing 4 K/V heads, and a SwiGLU MLP. The safetensors checkpoint loads strictly, and scratch logits match HF eager attention exactly.",
      "The KV cache is laid out per layer as [max requests, kv heads, max length, head dim], which costs exactly 22 KiB per cached token per request. Generation-stamped handles make a released slot unreadable through a stale handle.",
      "The scheduler works like a real engine’s: decode every active request each step, release finished ones, admit queued requests into freed slots, and prefill newcomers in a separate right-padded microbatch.",
      "Capacity 4 is this laptop’s sweet spot at 4.63× batch-1 throughput, while capacity 16 collapses below batch 1. Fitting in memory is not a batch-size policy.",
      "INT8 gives 1.885× storage compression, 0.99907 logit cosine similarity, and +3.48% perplexity. The portable path is slower because dequantization isn’t fused, and the report treats that as a result, not something to hide.",
      "FastAPI runs a background scheduler worker, so concurrent HTTP requests are admitted mid-flight between decode steps.",
    ],
    learned:
      "A serving optimization only counts once a correctness gate proves the tokens didn’t change. And a negative result reported precisely is worth more than a vague win.",
  },
};

export const projects: Project[] = [
  {
    id: "tomshield",
    title: "Tomshield",
    kind: "Startup · Founding member & technical lead",
    period: "2024 – 2026",
    summary:
      "A platform that automates insurance-coverage verification for leasing and finance companies. It grew to about 600 users before the startup wound down in early 2026.",
    bullets: [
      "Built the Node.js/Express and PostgreSQL backend, with Tesseract OCR and LLM-based extraction of policy details from uploaded documents.",
      "Integrated insurance-carrier APIs to verify coverage at the source, and routed missing or mismatched policies to human review, replacing days of manual checks.",
    ],
    tech: ["Node.js", "Express", "PostgreSQL", "Tesseract OCR", "LLM APIs"],
  },
  {
    id: "nlp-finance",
    title: "NLP for Finance",
    kind: "Independent project",
    period: "2025",
    summary:
      "Classical ML vs. an LSTM vs. fine-tuned BERT on financial text, benchmarked head to head. BERT reached 96.9% test accuracy.",
    bullets: [
      "Fine-tuned BertForSequenceClassification with AdamW and linear warm-up to 96.9% test accuracy.",
      "Built the preprocessing pipeline (NLTK tokenization, lemmatization, stop-word filtering) and evaluated with multi-label confusion matrices.",
    ],
    tech: ["PyTorch", "Hugging Face", "Keras", "NLTK", "scikit-learn"],
    href: "https://github.com/akshat10343/NLP-for-Finance",
  },
  {
    id: "solarsave",
    title: "SolarSave",
    kind: "Independent project",
    period: "2024",
    summary:
      "A full-stack app that estimates a home’s solar potential and payback period from its location.",
    bullets: [
      "Express REST API over geocoding and solar-irradiance APIs, with input validation and rate limiting.",
      "System sizing, tariff handling, and payback math behind an interactive React UI.",
    ],
    tech: ["React", "Node.js", "Express", "REST APIs"],
    href: "https://github.com/akshat10343/SolarSave",
  },
  {
    id: "calorie-counter",
    title: "Calorie Counter",
    kind: "Independent project",
    period: "2024 – 2025",
    summary:
      "A nutrition lookup tool built on a small ETL pipeline that turns messy spreadsheets into clean, searchable data.",
    bullets: [
      "Python ETL that converts Excel nutrition data into a normalized JSON dataset.",
      "Client-side search with multi-term matching over the cleaned data.",
    ],
    tech: ["Python", "JavaScript", "JSON"],
    href: "https://github.com/akshat10343/Calorie-Counter",
  },
];

export type Role = {
  role: string;
  org: string;
  period: string;
  points: string[];
};

export const experience: Role[] = [
  {
    role: "AI/ML Research Intern",
    org: "Nokia Bell Labs",
    period: "Jun – Aug 2026",
    points: [
      "Built a reproducible ML pipeline for network intrusion detection: audited two public benchmarks for label leakage and compared three model families under one frozen evaluation protocol (best PR-AUC 0.995).",
    ],
  },
  {
    role: "Founding Member & Technical Lead",
    org: "Tomshield",
    period: "Nov 2024 – Jan 2026",
    points: [
      "Built the backend for an insurance-verification platform (Node.js, PostgreSQL, OCR, LLM extraction, carrier APIs) and grew it to about 600 users.",
    ],
  },
  {
    role: "Undergraduate Teaching Assistant",
    org: "University of Washington",
    period: "Jan 2025 – now",
    points: [
      "Teach programming fundamentals and data structures (CSS 142/143) to about 30 students a quarter.",
    ],
  },
  {
    role: "Software Engineering Intern",
    org: "Pacific Northwest Chess Center",
    period: "Jun 2023 – Jan 2024",
    points: [
      "Automated tournament check-in and board setup across 15+ events, cutting average wait times by 35%.",
    ],
  },
];

export const leadership: Role[] = [
  {
    role: "President",
    org: "Trickfire Robotics",
    period: "Dec 2024 – now",
    points: ["Lead a 150+ member robotics organization across 5 engineering sub-teams."],
  },
  {
    role: "Founder & President",
    org: "Eco Car Club",
    period: "Mar 2025 – now",
    points: ["Founded the club, recruited 60+ members, and run weekly hands-on design workshops."],
  },
];

export const toolbox: Array<{ title: string; items: string[] }> = [
  { title: "Languages", items: ["Python", "Java", "C++", "JavaScript", "SQL", "Swift"] },
  {
    title: "Machine learning",
    items: ["PyTorch", "Hugging Face Transformers", "TensorFlow / Keras", "scikit-learn", "pandas", "NumPy", "NLTK"],
  },
  {
    title: "Systems & backend",
    items: ["FastAPI", "Node.js", "Express", "PostgreSQL", "React", "REST APIs"],
  },
  {
    title: "Tooling",
    items: ["Git", "Linux", "Docker", "pytest", "PyArrow / Parquet"],
  },
];

export const contact = {
  heading: "Let’s talk.",
  body: "I’m looking for Summer 2027 internships in software, ML, and systems. Email is the fastest way to reach me.",
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
    tag: "Data forensics",
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
    tag: "Methodology",
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

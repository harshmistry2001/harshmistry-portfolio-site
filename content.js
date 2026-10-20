/* ------------------------------------------------------------------
   ALL YOUR WORDS AND PROJECTS LIVE HERE.
   Edit the text between the quotes. Keep the commas and brackets.
   Images go in assets/img/ and are referenced by path.
   ------------------------------------------------------------------ */
window.SITE = {
  // Browser tab title and search description
  meta: {
    title: "Harsh Mistry | Customer research and analytics",
    description: "Portfolio of Harsh Mistry: customer research, marketing analytics and storytelling."
  },

  name: "Harsh Mistry",
  nav: [
    { label: "Work",    href: "#work" },
    { label: "Fit",     href: "#fit" },
    { label: "Contact", href: "#contact" }
  ],

  hero: {
    note: "hi, I'm Harsh",                                  // handwritten line
    headline: "I turn customer feedback into decisions.",
    primary:   { label: "See the work", href: "#work" },
    secondary: { label: "Say hi",       href: "#contact" },
    // Three images for the 3D stack: [front, back, small corner]
    stack: [
      "/assets/img/dashboard.jpg",
      "/assets/img/slide.jpg",
      "/assets/img/nanook.jpg"
    ]
  },

  work: {
    note: "things I made",
    title: "Work",
    // Filter buttons. Each project below uses one of these as its "lens".
    lenses: ["Listen", "Measure", "Tell", "Build"],
    projects: [
      {
        id: "luna",                       // short id, used by the skills below
        lens: "Measure",
        title: "LunaGlow",
        link: "https://github.com/harshmistry2001/marketing-analytics-portfolio",
        image: "/assets/img/dashboard.jpg",
        alt: "LunaGlow marketing analytics dashboard with revenue, ad spend, ROAS and channel charts",
        big: "95%",                       // the one number (or word) that sells it
        caption: "CAC gap, Google vs TikTok"
      },
      {
        id: "festival",
        lens: "Listen",
        title: "Festival feedback",
        // no image: the tile shows the big number alone. Add a photo any time.
        big: "-75%",
        caption: "guest complaints, 500+ staff"
      },
      {
        id: "fourth",
        lens: "Tell",
        title: "Fourth Wall",
        image: "/assets/img/slide.jpg",
        alt: "Slide on parasocial interaction with three cards: builds trust, shared attention, emotional bond",
        big: "1-WAY",
        caption: "why direct address feels like a friend"
      },
      {
        id: "nanook",
        lens: "Tell",
        title: "Nanook of the North",
        image: "/assets/img/nanook.jpg",
        imagePosition: "center 28%",      // which part of the image to show when cropped
        alt: "1922 poster of Nanook of the North with portraits and a sled dog",
        big: "1922",
        caption: "preserved is not neutral"
      },
      {
        id: "autofill",
        lens: "Build",
        title: "Job-form autofill",
        link: "https://github.com/harshmistry2001/Autofill_Job_application",
        image: "/assets/img/autofill.jpg",
        imageFit: "contain",              // "contain" shows the whole image, small
        alt: "Application Autofill extension popup with Fill this page and Undo buttons",
        big: "78",
        caption: "tests, with undo"
      },
      {
        id: "restaurant",
        lens: "Build",
        title: "Mažoji Himalaja",
        link: "https://github.com/harshmistry2001/Restaurant-website",
        image: "/assets/img/restaurant.jpg",
        alt: "Mažoji Himalaja restaurant website in Vilnius",
        big: "VILNIUS",
        caption: "momo and tandoori"
      }
    ]
  },

  fit: {
    note: "what I can do",
    title: "Where I fit",
    hint: "Tap a skill to see the proof.",
    // tiles = project ids to highlight. Leave [] if there is no tile for it yet.
    skills: [
      { label: "Customer research",   tiles: ["festival"],         proof: "Festival feedback loop: complaints down 75%." },
      { label: "Qual + quant",        tiles: ["fourth", "luna"],   proof: "Fourth Wall research and the LunaGlow analysis." },
      { label: "Feedback themes",     tiles: ["festival"],         proof: "Guest feedback sorted into themes, then fixed." },
      { label: "Insights to action",  tiles: ["luna"],             proof: "LunaGlow: move budget, +17% conversions at the same spend." },
      { label: "Excel / Sheets",      tiles: ["festival"],         proof: "KPI reports for 500+ festival staff." },
      { label: "PowerPoint / Slides", tiles: ["fourth", "nanook"], proof: "Two university presentations." },
      { label: "CRM basics",          tiles: [],                   proof: "HubSpot certificate." },
      { label: "Segmentation",        tiles: [],                   proof: "Customer segments on Online Retail data (GitHub: Data-analysis)." },
      { label: "Workflow design",     tiles: ["autofill"],         proof: "Autofill extension: English and German field map, undo, 78 tests." }
      // Customer-journey mapping is not here yet. Add it when you have a real example.
    ]
  },

  contact: {
    note: "say hi",
    title: "Let's talk.",
    email: "harshlmistry313@gmail.com",
    line: "Berlin first. Open to Munich and abroad.",
    links: [
      { label: "LinkedIn", href: "https://linkedin.com/in/harsh-mistry-6508b920b" },
      { label: "GitHub",   href: "https://github.com/harshmistry2001" },
      { label: "Statistics reference", href: "/stats/" }
    ]
  },

  footer: "harshmistry.de"
};

export interface Developer {
  id: number;
  name: string;
  primaryLanguage: string;
  framework: string;
  activityLevel: number;
  expertise: string;
  github: string;
  linkedin: string;
  projects: number;
  contributions: number;
  bio: string;
  currentProject: string;
}

export const mockDevelopers: Developer[] = [
  {
    id: 1,
    name: "Alex Chen",
    primaryLanguage: "JavaScript",
    framework: "React",
    activityLevel: 95,
    expertise: "Senior",
    github: "https://github.com/alexchen",
    linkedin: "https://linkedin.com/in/alexchen",
    projects: 42,
    contributions: 1250,
    bio: "Full-stack React wizard, loves building scalable web apps",
    currentProject: "E-commerce Platform"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    primaryLanguage: "Python",
    framework: "Django",
    activityLevel: 87,
    expertise: "Senior",
    github: "https://github.com/sarahj",
    linkedin: "https://linkedin.com/in/sarahjohnson",
    projects: 38,
    contributions: 980,
    bio: "ML engineer passionate about AI ethics and clean code",
    currentProject: "AI Recommendation System"
  },
  {
    id: 3,
    name: "Marcus Williams",
    primaryLanguage: "Solidity",
    framework: "Web3",
    activityLevel: 92,
    expertise: "Expert",
    github: "https://github.com/marcusw",
    linkedin: "https://linkedin.com/in/marcuswilliams",
    projects: 28,
    contributions: 750,
    bio: "Blockchain architect, DeFi protocol designer",
    currentProject: "Decentralized Exchange"
  },
  {
    id: 4,
    name: "Emma Davis",
    primaryLanguage: "TypeScript",
    framework: "Angular",
    activityLevel: 78,
    expertise: "Mid-level",
    github: "https://github.com/emmad",
    linkedin: "https://linkedin.com/in/emmadavis",
    projects: 25,
    contributions: 560,
    bio: "Frontend enthusiast, UX-minded developer",
    currentProject: "Banking Dashboard"
  },
  {
    id: 5,
    name: "James Liu",
    primaryLanguage: "Python",
    framework: "FastAPI",
    activityLevel: 85,
    expertise: "Senior",
    github: "https://github.com/jamesliu",
    linkedin: "https://linkedin.com/in/jamesliu",
    projects: 33,
    contributions: 820,
    bio: "Backend API architect, microservices expert",
    currentProject: "Healthcare Platform"
  },
  {
    id: 6,
    name: "Sophia Rodriguez",
    primaryLanguage: "JavaScript",
    framework: "Vue.js",
    activityLevel: 91,
    expertise: "Senior",
    github: "https://github.com/sophiar",
    linkedin: "https://linkedin.com/in/sophiarodriguez",
    projects: 45,
    contributions: 1100,
    bio: "Vue.js core contributor, performance optimization guru",
    currentProject: "Real-time Analytics"
  },
  {
    id: 7,
    name: "David Kim",
    primaryLanguage: "Go",
    framework: "Gin",
    activityLevel: 89,
    expertise: "Senior",
    github: "https://github.com/davidkim",
    linkedin: "https://linkedin.com/in/davidkim",
    projects: 30,
    contributions: 670,
    bio: "Go evangelist, cloud-native systems developer",
    currentProject: "Container Orchestration"
  },
  {
    id: 8,
    name: "Priya Sharma",
    primaryLanguage: "Java",
    framework: "Spring Boot",
    activityLevel: 83,
    expertise: "Senior",
    github: "https://github.com/priyas",
    linkedin: "https://linkedin.com/in/priyasharma",
    projects: 35,
    contributions: 890,
    bio: "Enterprise Java developer, distributed systems expert",
    currentProject: "Payment Processing System"
  },
  {
    id: 9,
    name: "Ryan Thompson",
    primaryLanguage: "Rust",
    framework: "Actix",
    activityLevel: 94,
    expertise: "Expert",
    github: "https://github.com/ryant",
    linkedin: "https://linkedin.com/in/ryanthompson",
    projects: 22,
    contributions: 540,
    bio: "Systems programmer, memory safety advocate",
    currentProject: "High-Performance Database"
  },
  {
    id: 10,
    name: "Luna Martinez",
    primaryLanguage: "Solidity",
    framework: "Hardhat",
    activityLevel: 88,
    expertise: "Mid-level",
    github: "https://github.com/lunam",
    linkedin: "https://linkedin.com/in/lunamartinez",
    projects: 18,
    contributions: 420,
    bio: "Smart contract developer, NFT marketplace creator",
    currentProject: "Gaming NFT Platform"
  },
  {
    id: 11,
    name: "Oliver Brown",
    primaryLanguage: "Python",
    framework: "TensorFlow",
    activityLevel: 86,
    expertise: "Expert",
    github: "https://github.com/oliverb",
    linkedin: "https://linkedin.com/in/oliverbrown",
    projects: 27,
    contributions: 715,
    bio: "ML researcher, computer vision specialist",
    currentProject: "Autonomous Vehicle Vision"
  },
  {
    id: 12,
    name: "Chloe Wang",
    primaryLanguage: "JavaScript",
    framework: "Next.js",
    activityLevel: 90,
    expertise: "Senior",
    github: "https://github.com/chloew",
    linkedin: "https://linkedin.com/in/chloewang",
    projects: 38,
    contributions: 950,
    bio: "Full-stack Next.js developer, JAMstack enthusiast",
    currentProject: "Content Management Platform"
  }
];

export default mockDevelopers;

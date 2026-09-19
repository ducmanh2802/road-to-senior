import type { LucideIcon } from 'lucide-vue-next';
import {
  LayoutDashboard,
  Map,
  Coffee,
  Leaf,
  Layers,
  MessageSquare,
  Database,
  Cpu,
  Hammer,
  FolderGit2,
  Bug,
  DraftingCompass,
  Cloud,
  FileText,
  Award,
  CloudCog,
  Brush,
  AlertOctagon,
  Repeat,
  BarChart3,
  type LucideProps,
} from 'lucide-vue-next';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Sub-item of the group's first entry when true */
  child?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/** Derived from the canonical route table — no duplicated route definitions. */
export const navSections: NavSection[] = [
  {
    title: 'COMMAND CENTER',
    items: [{ label: 'Command Center', to: '/', icon: LayoutDashboard }],
  },
  {
    title: 'LEARNING',
    items: [
      { label: 'Learning Path', to: '/learning', icon: Map },
      { label: 'Java 25', to: '/learning/java', icon: Coffee, child: true },
      { label: 'Spring Boot', to: '/learning/spring', icon: Leaf, child: true },
      { label: 'Microservices', to: '/learning/microservices', icon: Layers, child: true },
      { label: 'Kafka', to: '/learning/kafka', icon: MessageSquare, child: true },
      { label: 'Redis', to: '/learning/redis', icon: Database, child: true },
      { label: 'Databases', to: '/learning/databases', icon: Database, child: true },
      { label: 'System Design', to: '/learning/system-design', icon: Cpu, child: true },
    ],
  },
  {
    title: 'BUILD',
    items: [
      { label: 'Build Labs', to: '/build', icon: Hammer },
      { label: 'Projects', to: '/build/projects', icon: FolderGit2, child: true },
      { label: 'Break & Debug', to: '/build/break-debug', icon: Bug, child: true },
    ],
  },
  {
    title: 'ARCHITECTURE',
    items: [
      { label: 'Architecture Labs', to: '/architecture', icon: DraftingCompass },
      { label: 'AWS Patterns', to: '/architecture/aws-patterns', icon: Cloud, child: true },
      { label: 'Architecture Decisions', to: '/architecture/decisions', icon: FileText, child: true },
    ],
  },
  {
    title: 'CERTIFICATIONS',
    items: [
      { label: 'AWS', to: '/certifications', icon: CloudCog },
      { label: 'AIF-C01', to: '/certifications/aws/aif-c01', icon: Award, child: true },
 { label: 'Future Certifications', to: '/certifications', icon: Brush, child: true },
    ],
  },
  {
    title: 'INTERVIEW',
    items: [
      { label: 'Java', to: '/interview', icon: Coffee, child: true },
      { label: 'Spring', to: '/interview', icon: Leaf, child: true },
      { label: 'Microservices', to: '/interview', icon: Layers, child: true },
      { label: 'System Design', to: '/interview', icon: Cpu, child: true },
      { label: 'AWS', to: '/interview', icon: Cloud, child: true },
    ],
  },
  {
    title: 'REVIEW',
    items: [
      { label: 'Mistakes', to: '/review/mistakes', icon: AlertOctagon },
      { label: 'Flashcards', to: '/review/flashcards', icon: Repeat },
      { label: 'Progress', to: '/review/progress', icon: BarChart3 },
    ],
  },
];

export type { LucideProps };

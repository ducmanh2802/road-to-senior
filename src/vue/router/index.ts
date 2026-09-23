import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import AppShell from '../layouts/AppShell.vue';
import PagePlaceholder from '../pages/PagePlaceholder.vue';

/**
 * Canonical route table — single source of truth.
 * Sidebar navigation and the command palette derive from this table
 * (nav meta: `meta.section`, `meta.title`, `meta.icon`).
 *
 * Pages not yet implemented render PagePlaceholder (an honest
 * "Coming next" state — no fake content, no fake progress).
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'command-center',
    component: () => import('../pages/CommandCenterPage.vue'),
    },
    {
      path: '/today',
      name: 'today',
      component: () => import('../pages/TodayViewPage.vue'),
      meta: { section: 'LEARNING', title: 'Today View' },
    },

  {
    path: '/learning',
    name: 'learning',
    component: PagePlaceholder,
    meta: { section: 'LEARNING', title: 'Learning Path' },
  },
  {
    path: '/learning/java',
    name: 'learning-java',
    component: () => import('../pages/LearningJavaPage.vue'),
    meta: { section: 'LEARNING', title: 'Java 25' },
  },
  {
    path: '/learning/spring',
    name: 'learning-spring',
    component: PagePlaceholder,
    meta: { section: 'LEARNING', title: 'Spring Boot' },
  },
  {
    path: '/learning/microservices',
    name: 'learning-microservices',
    component: PagePlaceholder,
    meta: { section: 'LEARNING', title: 'Microservices' },
  },
  {
    path: '/learning/kafka',
    name: 'learning-kafka',
    component: PagePlaceholder,
    meta: { section: 'LEARNING', title: 'Kafka' },
  },
  {
    path: '/learning/redis',
    name: 'learning-redis',
    component: PagePlaceholder,
    meta: { section: 'LEARNING', title: 'Redis' },
  },
  {
    path: '/learning/databases',
    name: 'learning-databases',
    component: PagePlaceholder,
    meta: { section: 'LEARNING', title: 'Databases' },
  },
  {
    path: '/learning/system-design',
    name: 'learning-system-design',
    component: PagePlaceholder,
    meta: { section: 'LEARNING', title: 'System Design' },
  },
  {
    path: '/build',
    name: 'build',
    component: PagePlaceholder,
    meta: { section: 'BUILD', title: 'Build Labs' },
  },
  {
    path: '/build/projects',
    name: 'build-projects',
    component: PagePlaceholder,
    meta: { section: 'BUILD', title: 'Projects' },
  },
  {
    path: '/build/break-debug',
    name: 'build-break-debug',
    component: PagePlaceholder,
    meta: { section: 'BUILD', title: 'Break & Debug' },
  },
  {
    path: '/architecture',
    name: 'architecture',
    component: PagePlaceholder,
    meta: { section: 'ARCHITECTURE', title: 'Architecture Labs' },
  },
  {
    path: '/architecture/aws-patterns',
    name: 'architecture-aws-patterns',
    component: PagePlaceholder,
    meta: { section: 'ARCHITECTURE', title: 'AWS Patterns' },
  },
  {
    path: '/architecture/decisions',
    name: 'architecture-decisions',
    component: PagePlaceholder,
    meta: { section: 'ARCHITECTURE', title: 'Architecture Decisions' },
  },
  {
    path: '/certifications',
    name: 'certifications',
    component: PagePlaceholder,
    meta: { section: 'CERTIFICATIONS', title: 'Certifications' },
  },
  {
    path: '/certifications/aws/aif-c01',
    name: 'certifications-aif-c01',
    component: PagePlaceholder,
    meta: { section: 'CERTIFICATIONS', title: 'AWS AIF-C01' },
  },
  {
    path: '/interview',
    name: 'interview',
    component: PagePlaceholder,
    meta: { section: 'INTERVIEW', title: 'Interview' },
  },
  {
    path: '/review',
    name: 'review',
    component: () => import('../pages/ReviewPage.vue'),
    meta: { section: 'REVIEW', title: 'Review' },
  },
  {
    path: '/review/mistakes',
    name: 'review-mistakes',
    component: PagePlaceholder,
    meta: { section: 'REVIEW', title: 'Mistakes' },
  },
  {
    path: '/review/flashcards',
    name: 'review-flashcards',
    component: PagePlaceholder,
    meta: { section: 'REVIEW', title: 'Flashcards' },
  },
  {
    path: '/review/progress',
    name: 'review-progress',
    component: PagePlaceholder,
    meta: { section: 'REVIEW', title: 'Progress' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: PagePlaceholder,
    meta: { section: 'SYSTEM', title: 'Not Found' },
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

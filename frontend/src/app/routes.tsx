import { createBrowserRouter, redirect } from "react-router";
import { Layout } from "./components/Layout";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { StudyPlan } from "./pages/StudyPlan";
import { Quiz } from "./pages/Quiz";
import { QuizTopicSelect } from "./pages/QuizTopicSelect";
import { Insights } from "./pages/Insights";
import { Squad } from "./pages/Squad";
import { Teaching } from "./pages/Teaching";
import { Feed } from "./pages/Feed";
import { Profile } from "./pages/Profile";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { CodeGrind } from "./code_grind/CodeGrind";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/app",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "study-plan", Component: StudyPlan },
      { path: "quiz-select", Component: QuizTopicSelect },
      { path: "quiz", Component: Quiz },
      { path: "insights", Component: Insights },
      { path: "squad", Component: Squad },
      { path: "teaching", Component: Teaching },
      { path: "feed", Component: Feed },
      { path: "profile", Component: Profile },
      { path: "teacher-dashboard", Component: TeacherDashboard },
      { path: "admin", Component: AdminDashboard },
      { path: "code-grind", Component: CodeGrind },
    ],
  },
  // Redirects for old routes
  { path: "/study-plan", loader: () => redirect("/app/study-plan") },
  { path: "/quiz", loader: () => redirect("/app/quiz") },
  { path: "/insights", loader: () => redirect("/app/insights") },
  { path: "/squad", loader: () => redirect("/app/squad") },
  { path: "/teaching", loader: () => redirect("/app/teaching") },
  { path: "/feed", loader: () => redirect("/app/feed") },
  { path: "/profile", loader: () => redirect("/app/profile") },
  { path: "/teacher-dashboard", loader: () => redirect("/app/teacher-dashboard") },
  { path: "/code-grind", loader: () => redirect("/app/code-grind") },
]);

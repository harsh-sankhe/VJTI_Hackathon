import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { StudyPlan } from "./pages/StudyPlan";
import { Quiz } from "./pages/Quiz";
import { Insights } from "./pages/Insights";
import { Squad } from "./pages/Squad";
import { Teaching } from "./pages/Teaching";
import { Feed } from "./pages/Feed";
import { Profile } from "./pages/Profile";
import { TeacherDashboard } from "./pages/TeacherDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "study-plan", Component: StudyPlan },
      { path: "quiz", Component: Quiz },
      { path: "insights", Component: Insights },
      { path: "squad", Component: Squad },
      { path: "teaching", Component: Teaching },
      { path: "feed", Component: Feed },
      { path: "profile", Component: Profile },
      { path: "teacher-dashboard", Component: TeacherDashboard },
    ],
  },
]);

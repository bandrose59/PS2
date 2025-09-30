import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";


// Feature Pages
import ProfileFeature from "./pages/features/ProfileFeature";
import OpportunitiesFeature from "./pages/features/OpportunitiesFeature";
import AIToolsFeature from "./pages/features/AIToolsFeature";
import DemoFeature from "./pages/features/DemoFeature";
import CertificatesFeature from "./pages/features/CertificatesFeature";
import CourseContent from "./pages/CourseContent";
import ToolPage from "./pages/features/ToolPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Main Pages */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/courses" element={<Courses />} />
          
          {/* Dynamic Course Detail */}
          <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/course/:id/content" element={<CourseContent />} />

               <Route path="/ai-tools" element={<AIToolsFeature />} />
        <Route path="/ai-tools/:toolId" element={<ToolPage />} />

          {/* Feature Pages */}
          <Route path="/features/profile" element={<ProfileFeature />} />
          <Route path="/features/opportunities" element={<OpportunitiesFeature />} />
          <Route path="/features/ai-tools" element={<AIToolsFeature />} />
          <Route path="/features/demo" element={<DemoFeature />} />
          <Route path="/features/certificates" element={<CertificatesFeature />} />
          <Route path="/features/placement" element={<DemoFeature />} />
          <Route path="/features/interviews" element={<DemoFeature />} />
          <Route path="/features/analytics" element={<DemoFeature />} />
          <Route path="/features/achievements" element={<DemoFeature />} />
          <Route path="/features/collaboration" element={<DemoFeature />} />
          <Route path="/features/applications" element={<DemoFeature />} />
          <Route path="/features/mentoring" element={<DemoFeature />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

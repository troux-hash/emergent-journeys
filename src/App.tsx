import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import OperatorProfile from "./pages/OperatorProfile.tsx";
import Privacy from "./pages/Privacy.tsx";
import Terms from "./pages/Terms.tsx";
import Unsubscribe from "./pages/Unsubscribe.tsx";
import AdminChat from "./pages/AdminChat.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import IntranetLayout from "./pages/IntranetLayout.tsx";
import IntranetDashboard from "./pages/intranet/IntranetDashboard.tsx";
import IntranetDocuments from "./pages/intranet/IntranetDocuments.tsx";
import IntranetTasks from "./pages/intranet/IntranetTasks.tsx";
import IntranetProjects from "./pages/intranet/IntranetProjects.tsx";
import IntranetOperators from "./pages/intranet/IntranetOperators.tsx";
import IntranetReviews from "./pages/intranet/IntranetReviews.tsx";
import IntranetSupport from "./pages/intranet/IntranetSupport.tsx";
import ReportIssue from "./pages/ReportIssue.tsx";
import LeaveReview from "./pages/LeaveReview.tsx";
import Discover from "./pages/Discover.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/report" element={<ReportIssue />} />
            <Route path="/operators/:slug" element={<OperatorProfile />} />
            <Route path="/review/:bookingId" element={<LeaveReview />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/admin/chat" element={<AdminChat />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/intranet" element={<IntranetLayout />}>
              <Route index element={<IntranetDashboard />} />
              <Route path="documents" element={<IntranetDocuments />} />
              <Route path="tasks" element={<IntranetTasks />} />
              <Route path="projects" element={<IntranetProjects />} />
              <Route path="operators" element={<IntranetOperators />} />
              <Route path="reviews" element={<IntranetReviews />} />
              <Route path="support" element={<IntranetSupport />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

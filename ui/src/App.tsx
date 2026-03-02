import { Routes, Route } from "react-router-dom";
import { LandingPage } from "@/pages/LandingPage";
import { SubmitCasePage } from "@/pages/SubmitCasePage";
import { SubmitConfirmationPage } from "@/pages/SubmitConfirmationPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { CaseViewPage } from "@/pages/CaseViewPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/submit" element={<SubmitCasePage />} />
      <Route path="/submit/confirmation" element={<SubmitConfirmationPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/cases/:id" element={<CaseViewPage />} />
    </Routes>
  );
}

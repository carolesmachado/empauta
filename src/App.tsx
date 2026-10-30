import { Navigate, Route, Routes } from "react-router-dom";
import { SenadoPage } from "./pages/SenadoPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/senado" replace />} />
      <Route path="/senado/:id?" element={<SenadoPage />} />
      <Route path="*" element={<Navigate to="/senado" replace />} />
    </Routes>
  );
}

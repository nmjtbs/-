import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import CommandCenterPage from "./pages/CommandCenterPage";
import MatchLabPage from "./pages/MatchLabPage";
import {
  buildMatchLabPath,
  DEFAULT_CUTOFF_TYPE,
  FALLBACK_MATCH_ID,
} from "./routing/dashboardRoutes";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate replace to="/command-center" />} />
        <Route path="/command-center" element={<CommandCenterPage />} />
        <Route
          path="/match-lab"
          element={
            <Navigate
              replace
              to={buildMatchLabPath(FALLBACK_MATCH_ID, DEFAULT_CUTOFF_TYPE)}
            />
          }
        />
        <Route path="/match-lab/:matchId" element={<MatchLabPage />} />
      </Route>
    </Routes>
  );
}

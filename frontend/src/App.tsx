import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { RequireRole } from "./auth/RequireRole";
import { Home } from "./pages/Home";
import { PatientLogin } from "./pages/patient/PatientLogin";
import { PatientAssistant } from "./pages/patient/PatientAssistant";
import { DoctorLogin } from "./pages/doctor/DoctorLogin";
import { DoctorAssistant } from "./pages/doctor/DoctorAssistant";
import { PatientLookup } from "./pages/doctor/PatientLookup";
import { ApprovalQueue } from "./pages/doctor/ApprovalQueue";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login/patient" element={<PatientLogin />} />
          <Route path="/login/doctor" element={<DoctorLogin />} />

          <Route
            path="/patient"
            element={
              <RequireRole role="patient">
                <PatientAssistant />
              </RequireRole>
            }
          />
          <Route
            path="/patient/chat/:chatId"
            element={
              <RequireRole role="patient">
                <PatientAssistant />
              </RequireRole>
            }
          />

          <Route
            path="/doctor"
            element={
              <RequireRole role="doctor">
                <DoctorAssistant />
              </RequireRole>
            }
          />
          <Route
            path="/doctor/chat/:chatId"
            element={
              <RequireRole role="doctor">
                <DoctorAssistant />
              </RequireRole>
            }
          />
          <Route
            path="/doctor/patients/:patientId"
            element={
              <RequireRole role="doctor">
                <PatientLookup />
              </RequireRole>
            }
          />
          <Route
            path="/doctor/approvals"
            element={
              <RequireRole role="doctor">
                <ApprovalQueue />
              </RequireRole>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

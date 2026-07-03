import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Dashboard } from '@/pages/Dashboard';
import { Login } from '@/pages/Login';
import { Patients } from '@/pages/Patients';
import { PatientDetails } from '@/pages/PatientDetails';
import { Appointments } from '@/pages/Appointments';
import { MedicalRecords } from '@/pages/MedicalRecords';
import { Billing } from '@/pages/Billing';
import { Staff } from '@/pages/Staff';
import { Branches } from '@/pages/Branches';
import { Reports } from '@/pages/Reports';
import { Campaigns } from '@/pages/Campaigns';

import { Revenue } from '@/pages/Revenue';
import { NotFound } from '@/pages/NotFound';
import Settings from '@/pages/Settings';
import { Doctors } from '@/pages/Doctors';
import { LivePatients } from '@/pages/LivePatients';
import { AttendancePayroll } from '@/pages/AttendancePayroll';
import { BedManagement } from '@/pages/BedManagement';
import { Vaccinations } from '@/pages/Vaccinations';
import type { Role } from '@/types/auth';


const PrivateRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: Role[] }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" index element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <PrivateRoute allowedRoles={['superadmin', 'admin', 'staff']}>
                <Patients />
              </PrivateRoute>
            }
          />
          <Route
            path="/patients/:id"
            element={
              <PrivateRoute allowedRoles={['superadmin', 'admin', 'staff']}>
                <PatientDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <PrivateRoute allowedRoles={['superadmin', 'admin', 'staff']}>
                <Appointments />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctors"
            element={
              <PrivateRoute allowedRoles={['superadmin', 'admin', 'staff']}>
                <Doctors />
              </PrivateRoute>
            }
          />
          <Route
            path="/records"
            element={
              <PrivateRoute allowedRoles={['superadmin', 'admin', 'staff']}>
                <MedicalRecords />
              </PrivateRoute>
            }
          />
          <Route
            path="/revenue"
            element={
              <PrivateRoute allowedRoles={['superadmin', 'admin']}>
                <Revenue />
              </PrivateRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <PrivateRoute allowedRoles={['superadmin', 'admin', 'staff']}>
                <Billing />
              </PrivateRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <PrivateRoute allowedRoles={['superadmin', 'admin']}>
                <Staff />
              </PrivateRoute>
            }
          />
          <Route
            path="/live-patients"
            element={
              <PrivateRoute allowedRoles={['superadmin', 'admin', 'staff']}>
                <LivePatients />
              </PrivateRoute>
            }
          />
          <Route
            path="/attendance-payroll"
            element={
              <PrivateRoute allowedRoles={['staff']}>
                <AttendancePayroll />
              </PrivateRoute>
            }
          />
          <Route
            path="/branches"
            element={
              <PrivateRoute allowedRoles={['superadmin', 'staff']}>
                <Branches />
              </PrivateRoute>
            }
          />
          <Route
            path="/beds"
            element={
              <PrivateRoute allowedRoles={['superadmin', 'admin', 'staff']}>
                <BedManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute allowedRoles={['superadmin']}>
                <Reports />
              </PrivateRoute>
            }
          />
          <Route
            path="/campaigns"
            element={
              <PrivateRoute allowedRoles={['superadmin', 'admin', 'staff']}>
                <Campaigns />
              </PrivateRoute>
            }
          />
          <Route
            path="/vaccinations"
            element={
              <PrivateRoute allowedRoles={['superadmin', 'admin', 'staff']}>
                <Vaccinations />
              </PrivateRoute>
            }
          />
          <Route path='/settings'
            element={
              <PrivateRoute allowedRoles={['superadmin', 'admin', 'staff']}>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
  );
}

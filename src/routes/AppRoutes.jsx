import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Members from '../pages/Members';
import Congregations from '../pages/Congregations';
import Finances from '../pages/Finances';
import Events from '../pages/Events';
import Users from '../pages/Users';
import Inventory from '../pages/Inventory';
import Institutions from '../pages/Institutions';
import PrivateRoute from './PrivateRoute';
import Layout from '../components/Layout';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/congregations" element={<Congregations />} />
            <Route path="/finances" element={<Finances />} />
            <Route path="/events" element={<Events />} />
            <Route path="/users" element={<Users />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/institutions" element={<Institutions />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

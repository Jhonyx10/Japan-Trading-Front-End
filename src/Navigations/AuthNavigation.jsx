import { Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from '../Layouts/AuthLayout'
import DashboardPage from '../Pages/AuthPages/DashboardPage'
import ProfilePage from '../Pages/AuthPages/ProfilePage'
import VehiclePage from '../Pages/AuthPages/VehiclePage'
import WorkersPage from '../Pages/AuthPages/Manage/Workers'
import ServicesPage from '../Pages/AuthPages/Manage/Services'
import RepairRequest from '../Pages/AuthPages/RepairJobs/RepairRequest'
import AssignedJobs from '../Pages/AuthPages/RepairJobs/AssignedJobs'
import RepairJobDetails from '../Pages/AuthPages/RepairJobs/RepairJobDetails'
import RepairHistory from '../Pages/AuthPages/RepairJobs/RepairHistory'
import Contracts from '../Pages/AuthPages/Invoices/Contracts'
import Payments from '../Pages/AuthPages/Invoices/Payments'
import Transactions from '../Pages/AuthPages/Invoices/Transactions'
import AssignWorker from '../Pages/AuthPages/Forms/AssignWorker'
import Stocks from '../Pages/AuthPages/Inventory/Stocks'
import InventoryMovement from '../Pages/AuthPages/Inventory/InventoryMovement'

const AuthNavigation = () => {
    return (
        <Routes>
            <Route element={<AuthLayout />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="vehicles" element={<VehiclePage />} />
                <Route path="manage/workers" element={<WorkersPage />} />
                <Route path="manage/services" element={<ServicesPage />} />
                <Route path="repair/requests" element={<RepairRequest />} />
                <Route path="repair/assigned" element={<AssignedJobs />} />
                <Route path="repair-job/:id" element={<RepairJobDetails />} />
                <Route path="repair/history" element={<RepairHistory />} />
                <Route path="invoices/contracts" element={<Contracts />} />
                <Route path="invoices/payments" element={<Payments />} />
                <Route path="invoices/transactions" element={<Transactions />} />
                <Route path="assign-worker" element={<AssignWorker />} />
                <Route path="inventory/stocks" element={<Stocks />} />
                <Route path="inventory/movements" element={<InventoryMovement />} />
                {/* Redirect all other unmatched sub-routes to dashboard */}
                <Route path="" element={<Navigate to="dashboard" replace />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
        </Routes>
    )
}

export default AuthNavigation

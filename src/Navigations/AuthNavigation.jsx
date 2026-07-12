import { Routes, Route, Navigate } from 'react-router-dom'
import AuthLayout from '../Layouts/AuthLayout'
import ProtectedRoute from '../components/ProtectedRoute'
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
import ViewInvoice from '../Pages/AuthPages/Invoices/ViewInvoice'
import Transactions from '../Pages/AuthPages/Invoices/Transactions'
import AssignWorker from '../Pages/AuthPages/Forms/AssignWorker'
import AddVehicle from '../Pages/AuthPages/Forms/AddVehicle'
import Stocks from '../Pages/AuthPages/Inventory/Stocks'
import InventoryMovement from '../Pages/AuthPages/Inventory/InventoryMovement'
import RevenueReport from '../Pages/AuthPages/Reports/RevenueReport'
import RepairsReport from '../Pages/AuthPages/Reports/RepairsReport'
import InventoryReport from '../Pages/AuthPages/Reports/InventoryReport'
import VehiclesReport from '../Pages/AuthPages/Reports/VehiclesReport'
import FinancialReport from '../Pages/AuthPages/Reports/FinancialReport'
import WalkInPayment from '../Pages/AuthPages/Payment/WalkinPayment'

const AuthNavigation = () => {
    return (
        <Routes>
            <Route
                element={
                    <ProtectedRoute>
                        <AuthLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="vehicles" element={<VehiclePage />} />
                <Route path="vehicles/add" element={<AddVehicle />} />
                <Route path="manage/workers" element={<WorkersPage />} />
                <Route path="manage/services" element={<ServicesPage />} />
                <Route path="repair/requests" element={<RepairRequest />} />
                <Route path="repair/assigned" element={<AssignedJobs />} />
                <Route path="repair-job/:id" element={<RepairJobDetails />} />
                <Route path="repair/history" element={<RepairHistory />} />
                <Route path="invoices/contracts" element={<Contracts />} />
                <Route path="invoices/transactions" element={<Transactions />} />
                <Route path="invoices/:id" element={<ViewInvoice />} />
                <Route path="assign-worker" element={<AssignWorker />} />
                <Route path="inventory/stocks" element={<Stocks />} />
                <Route path="inventory/movements" element={<InventoryMovement />} />
                <Route path="reports/revenue" element={<RevenueReport />} />
                <Route path="reports/repairs" element={<RepairsReport />} />
                <Route path="reports/inventory" element={<InventoryReport />} />
                <Route path="reports/vehicles" element={<VehiclesReport />} />
                <Route path="reports/financial" element={<FinancialReport />} />
                <Route path="payments/walk-in" element={<WalkInPayment />} />
                {/* Redirect all other unmatched sub-routes to dashboard */}
                <Route path="" element={<Navigate to="dashboard" replace />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
        </Routes>
    )
}

export default AuthNavigation

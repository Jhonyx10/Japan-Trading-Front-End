import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './Pages/HomePage'
import AuthNavigation from './Navigations/AuthNavigation'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />

        {/* Authenticated Dashboard Scope */}
        <Route path="/*" element={<AuthNavigation />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated, clearSession } from '../utils/auth'

const ProtectedRoute = ({ children }) => {
    const location = useLocation()

    if (!isAuthenticated()) {
        clearSession()

        return (
            <Navigate
                to="/"
                replace
                state={{
                    from: location.pathname,
                    reason: 'auth',
                }}
            />
        )
    }

    return children
}

export default ProtectedRoute

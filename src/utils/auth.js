import { $api } from '../api/client'
import { isRoleAllowedOnWeb } from '../constants/roles'

export const getAccessToken = () => {
    if (typeof localStorage === 'undefined') return null
    return localStorage.getItem('accessToken')
}

export const getUserData = () => {
    if (typeof localStorage === 'undefined') return null

    try {
        const raw = localStorage.getItem('userData')
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

export const isAdmin = () => isRoleAllowedOnWeb(getUserData()?.role)

export const isAuthenticated = () => Boolean(getAccessToken()) && isAdmin()

export const clearSession = () => {
    if (typeof localStorage === 'undefined') return

    localStorage.removeItem('accessToken')
    localStorage.removeItem('userData')
}

export const logout = async () => {
    try {
        if (getAccessToken()) {
            await $api('/logout', { method: 'POST' })
        }
    } catch {
        // Still clear local session even if the token is already invalid
    } finally {
        clearSession()
    }
}

export const saveSession = (accessToken, user) => {
    if (!isRoleAllowedOnWeb(user?.role)) {
        throw new Error('Only administrators can access the web dashboard.')
    }

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('userData', JSON.stringify(user))
}

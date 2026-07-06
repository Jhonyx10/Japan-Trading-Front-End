export const WEB_ALLOWED_ROLES = ['admin']

export const isRoleAllowedOnWeb = (role) => WEB_ALLOWED_ROLES.includes(role)

export type AuthUser = {
  id: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
  preferredLocale: 'en' | 'fa' | 'de' | null;
  isActive?: boolean;
};

export function isAdminRole(role?: string | null): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

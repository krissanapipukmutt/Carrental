export type Role = 'admin' | 'manager' | 'rental_agent' | 'mechanic';

export const isManager = (role?: Role | null) =>
  role === 'admin' || role === 'manager';

export const isStaff = (role?: Role | null) =>
  role === 'rental_agent' || role === 'mechanic';

export const canManageFleet = (role?: Role | null) =>
  role === 'admin' || role === 'manager' || role === 'mechanic';

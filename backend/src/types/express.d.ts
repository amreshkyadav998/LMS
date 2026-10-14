import type { Role } from "../constants/roles";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

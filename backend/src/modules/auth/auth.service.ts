import { ROLES } from "../../constants/roles";
import { User, type UserDocument } from "../../models/User";
import type { AuthUser } from "../../types/express";
import { ApiError } from "../../utils/ApiError";
import type { LoginInput, SignupInput } from "./auth.schema";
import { signAccessToken } from "./token";

interface AuthResult {
  user: AuthUser;
  token: string;
}

function toAuthResult(user: UserDocument): AuthResult {
  const authUser: AuthUser = { id: user.id, name: user.name, email: user.email, role: user.role };
  const token = signAccessToken({ sub: authUser.id, role: authUser.role, name: authUser.name });
  return { user: authUser, token };
}

/** Public sign-up always creates a borrower; staff accounts are provisioned by the seed script. */
export async function signup(input: SignupInput): Promise<AuthResult> {
  if (await User.exists({ email: input.email })) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const user = await User.create({ ...input, role: ROLES.BORROWER });
  return toAuthResult(user);
}

export async function login({ email, password }: LoginInput): Promise<AuthResult> {
  const user = await User.findOne({ email }).select("+password");

  // Same message for unknown email and wrong password, to avoid account enumeration.
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  return toAuthResult(user);
}

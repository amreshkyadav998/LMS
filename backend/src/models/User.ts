import bcrypt from "bcryptjs";
import { Schema, model, type HydratedDocument, type Model } from "mongoose";
import { ALL_ROLES, ROLES, type Role } from "../constants/roles";

const SALT_ROUNDS = 12;

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

type UserModel = Model<IUser, object, IUserMethods>;
export type UserDocument = HydratedDocument<IUser, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ALL_ROLES, default: ROLES.BORROWER, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  },
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

userSchema.method("comparePassword", function comparePassword(this: UserDocument, candidate: string) {
  return bcrypt.compare(candidate, this.password);
});

export const User = model<IUser, UserModel>("User", userSchema);

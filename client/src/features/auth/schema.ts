import { z } from "zod";
import {
  NAME_MAX,
  NAME_MIN,
  NAME_PATTERN,
  PASSWORD_MAX,
  PASSWORD_MIN,
  PASSWORD_PATTERN,
  PHONE_PATTERN,
} from "@/lib/validation/constants";

export const signInSchema = z.object({
  email: z.email("Invalid email address"),
  // Sign-in only requires a non-empty password — server validates against the
  // stored hash. Strength rules apply at sign-up / change-password.
  password: z.string().min(1, "Password is required"),
});

const nameSchema = z
  .string()
  .min(NAME_MIN, `Must be at least ${NAME_MIN} characters`)
  .max(NAME_MAX, `Must be at most ${NAME_MAX} characters`)
  .regex(NAME_PATTERN, "Only letters, spaces, apostrophes, and hyphens are allowed");

const strongPassword = z
  .string()
  .min(PASSWORD_MIN, `Must be at least ${PASSWORD_MIN} characters`)
  .max(PASSWORD_MAX, `Must be at most ${PASSWORD_MAX} characters`)
  .regex(
    PASSWORD_PATTERN,
    "Password must contain uppercase, lowercase, number, and special character",
  );

export const signUpSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: z.email("Invalid email address"),
    phoneNumber: z.string().regex(PHONE_PATTERN, "Invalid phone number"),
    password: strongPassword,
    confirmPassword: z
      .string()
      .min(PASSWORD_MIN, `Must be at least ${PASSWORD_MIN} characters`)
      .max(PASSWORD_MAX, `Must be at most ${PASSWORD_MAX} characters`),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

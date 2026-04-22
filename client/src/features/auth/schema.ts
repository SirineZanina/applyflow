import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const nameSchema = z
  .string()
  .min(2, "Must be at least 2 characters")
  .max(50, "Must be at most 50 characters")
  .regex(
    /^[\p{L} '-]+$/u,
    "Only letters, spaces, apostrophes, and hyphens are allowed",
  );

export const signUpSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: z.email("Invalid email address"),
    phoneNumber: z.string().regex(/^\+?[1-9]\d{8,13}$/, "Invalid phone number"),
    password: z
      .string()
      .min(8, "Must be at least 8 characters")
      .max(100, "Must be at most 100 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).*$/,
        "Password must contain uppercase, lowercase, number, and special character",
      ),
    confirmPassword: z
      .string()
      .min(8, "Must be at least 8 characters")
      .max(100, "Must be at most 100 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

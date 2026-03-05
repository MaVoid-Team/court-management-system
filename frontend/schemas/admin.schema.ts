import { z } from "zod";

export const adminSchema = z.object({
    id: z.string(),
    email: z.string(),
    role: z.enum(["super_admin", "branch_admin"]),
    branch_id: z.number().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});

export type Admin = z.infer<typeof adminSchema>;

export const adminFormSchema = z.object({
    branch_id: z.number().nullable().optional(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string(),
    role: z.enum(["super_admin", "branch_admin"]),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
});

export type AdminFormData = z.infer<typeof adminFormSchema>;

export const adminUpdateSchema = z.object({
    email: z.string().email("Invalid email address").optional(),
    role: z.enum(["super_admin", "branch_admin"]).optional(),
    branch_id: z.number().nullable().optional(),
});

export type AdminUpdateData = z.infer<typeof adminUpdateSchema>;

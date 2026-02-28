"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { loginSchema, registroSchema } from "@/lib/utils/validators";

export async function signIn(formData: FormData) {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Credenciales incorrectas" };
  }

  redirect("/");
}

export async function signUp(formData: FormData) {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    nombre_tienda: formData.get("nombre_tienda") as string,
  };

  const parsed = registroSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  // 1. Create auth user (trigger may or may not create profile)
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        nombre_tienda: parsed.data.nombre_tienda,
      },
    },
  });

  if (signUpError) {
    console.error("SignUp error:", signUpError.message, signUpError.status);
    return { error: signUpError.message };
  }

  // 2. Ensure profile exists (don't rely solely on trigger)
  const userId = signUpData.user?.id;
  if (userId) {
    await supabase.from("perfiles").upsert(
      {
        id: userId,
        email: parsed.data.email,
        nombre_tienda: parsed.data.nombre_tienda,
      },
      { onConflict: "id" }
    );
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

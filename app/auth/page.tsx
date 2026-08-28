import type { Metadata } from "next";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Acceso · Arcade Vault",
  description: "Inicia sesión o crea tu cuenta para competir por puntos.",
};

export default function AuthPage() {
  return (
    <div className="av-auth-wrap fade-in">
      <AuthForm />
    </div>
  );
}

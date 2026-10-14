"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { MENU, can } from "@/lib/access";

function LoginForm() {
  const { user, ready, login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // já logado? não precisa ver o login
  useEffect(() => {
    if (ready && user) router.replace("/inicio");
  }, [ready, user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const logged = await login(email.trim(), password);
      // volta para a página que o usuário tentou abrir, se ele puder acessá-la
      const from = params.get("from");
      const allowed = MENU.some((m) => m.path === from && can(logged.permissions, m.permission));
      router.replace(allowed && from ? from : "/inicio");
    } catch (err) {
      setError(err instanceof Error && err.message !== "Failed to fetch" ? err.message : "Não foi possível conectar ao servidor.");
      setLoading(false);
    }
  }

  return (
    <div className="login">
      <section className="login-hero">
        <div className="logo">
          <span className="logo-mark">D</span>
          <span className="logo-text"><strong>DEPPI</strong><small>IFCE · Extensão</small></span>
        </div>
        <span className="photo-ph">[ foto do campus / alunos em aula ]</span>
        <div>
          <h2>Cursos de extensão<br />do IFCE, num só lugar.</h2>
          <p>Inscreva-se, envie seus documentos e acompanhe a análise da sua inscrição.</p>
        </div>
      </section>

      <section className="login-form-side">
        <form onSubmit={handleSubmit} noValidate>
          <h1>Entrar</h1>
          <p className="muted small">Use seu e-mail institucional.</p>

          {error && (
            <div className="alert" role="alert">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <label>
            E-mail institucional
            <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </label>
          <label>
            Senha
            <span className="pw">
              <input type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="icon-btn" onClick={() => setShow((s) => !s)} aria-label={show ? "Ocultar senha" : "Mostrar senha"}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </span>
          </label>

          <button className="btn" disabled={loading || !email || !password}>{loading ? "Entrando..." : "Entrar"}</button>

          <div className="or"><span>ou</span></div>
          <p className="muted small center">Ainda não tem conta? <Link href="/cadastro">Crie sua conta</Link></p>
        </form>
      </section>
    </div>
  );
}

// useSearchParams exige Suspense no Next
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
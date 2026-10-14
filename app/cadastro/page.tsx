import Link from "next/link";

export default function CadastroPage() {
  return (
    <div className="center-page">
      <h1>Criar conta</h1>
      <p className="muted">Esta tela será entregue nas próximas etapas.</p>
      <Link className="btn" href="/login">Voltar ao login</Link>
    </div>
  );
}
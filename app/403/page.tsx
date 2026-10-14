import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="center-page">
      <h1 className="big">403</h1>
      <p>Você não tem permissão para acessar esta página.</p>
      <Link className="btn" href="/inicio">Voltar ao início</Link>
    </div>
  );
}
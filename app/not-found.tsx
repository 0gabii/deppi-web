import Link from "next/link";

export default function NotFound() {
  return (
    <div className="center-page">
      <h1 className="big">404</h1>
      <p>Página não encontrada.</p>
      <Link className="btn" href="/">Voltar ao início</Link>
    </div>
  );
}
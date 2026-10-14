// Mapeia o nome do cargo vindo da API para o nome usado na tela
const ROLE_LABELS: Record<string, string> = {
  Administrador: "ADMIN",
  DEPPI: "DEPPI",
  Professor: "PROFESSOR",
  Aluno: "ALUNO",
};

export const roleLabel = (role: string) => ROLE_LABELS[role] ?? role.toUpperCase();

export type MenuItem = {
  label: string;
  path: string;
  icon: "home" | "courses" | "institutions" | "users" | "reports" | "profile";
  permission?: string; // slug exigido (igual ao que o backend envia). Sem valor = qualquer logado
};

// Fonte única: o menu E as rotas usam esta lista, então não aparece no
// menu algo que a rota bloqueia (nem o contrário).
export const MENU: MenuItem[] = [
  { label: "Início", path: "/inicio", icon: "home" },
  { label: "Cursos", path: "/cursos", icon: "courses", permission: "view-courses" },
  { label: "Instituições", path: "/instituicoes", icon: "institutions", permission: "manage-institutions" },
  { label: "Usuários", path: "/usuarios", icon: "users", permission: "manage-users" },
  { label: "Relatórios", path: "/relatorios", icon: "reports", permission: "view-reports" },
  { label: "Perfil", path: "/perfil", icon: "profile", permission: "view-profile" },
];

export const can = (permissions: string[], permission?: string) =>
  !permission || permissions.includes(permission);

export const menuFor = (permissions: string[]) => MENU.filter((m) => can(permissions, m.permission));

export const homeFor = () => "/inicio";
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export const fmtN = (n: number) => n.toLocaleString("pt-BR");

export function fmtData(iso: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${Number(d)} ${MESES[Number(m) - 1]} ${y}`;
}

export function fmtHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function ha(iso: string | null, hoje = new Date()): string {
  if (!iso) return "";
  const dias = Math.round((hoje.getTime() - new Date(iso.slice(0, 10) + "T12:00:00").getTime()) / 864e5);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  if (dias < 30) return `há ${dias} dias`;
  const m = Math.round(dias / 30);
  if (m < 12) return `há ${m} ${m === 1 ? "mês" : "meses"}`;
  return `em ${fmtData(iso)}`;
}

export const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function iniciais(nome: string): string {
  return nome
    .split(/\s+/)
    .filter((w) => w.length > 2 || /^[A-ZÀ-Ú]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

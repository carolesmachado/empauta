import { useCallback, useState } from "react";

const KEY = "empauta-salvos";

function ler(): Set<number> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

export function useSalvos() {
  const [salvos, setSalvos] = useState<Set<number>>(ler);
  const alternar = useCallback((id: number) => {
    setSalvos((atual) => {
      const novo = new Set(atual);
      novo.has(id) ? novo.delete(id) : novo.add(id);
      try {
        localStorage.setItem(KEY, JSON.stringify([...novo]));
      } catch {
        /* armazenamento indisponível: mantém só na sessão */
      }
      return novo;
    });
  }, []);
  return { salvos, alternar };
}

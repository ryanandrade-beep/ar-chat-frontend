export const digitos = (valor: string) => valor.replace(/\D/g, '');

export function mascaraCpf(valor: string) {
  const d = digitos(valor).slice(0, 11);
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function mascaraCnpj(valor: string) {
  const d = digitos(valor).slice(0, 14);
  return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export function mascaraTelefone(valor: string) {
  const d = digitos(valor).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Confere os dígitos verificadores do CPF ou do CNPJ (a mesma regra do backend). */
export function documentoValido(valor: string, tipo: 'CPF' | 'CNPJ') {
  const d = digitos(valor);
  const tamanho = tipo === 'CPF' ? 11 : 14;
  if (d.length !== tamanho || /^(\d)\1+$/.test(d)) return false;
  const pesos = tipo === 'CPF' ? [11, 10, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const dv = (n: number) => {
    const inicio = pesos.length - n;
    const soma = [...d.slice(0, n)].reduce((s, c, i) => s + Number(c) * pesos[inicio + i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return dv(tamanho - 2) === Number(d[tamanho - 2]) && dv(tamanho - 1) === Number(d[tamanho - 1]);
}

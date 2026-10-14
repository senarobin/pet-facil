export function formatarReais(valor) {

  if(valor === undefined || valor === null || isNaN(valor)) {
    return 'R$ 0,00';
  }

  return Number(valor).toLocaleString('pt-BR',{
    style: 'currency',currency: 'BRL'});
}

export function formatarData(dataString) {

  if (!dataString) {
    return '';
  }

  const partes = dataString.split('-');

  if(partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  return dataString;
}

export function mascararCpf(valor) {
  if (!valor) return '';

  return valor
    .replace(/\D/g, '').slice(0,11).replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');
}



export function validarCpf(cpf) {

  if(!cpf){
    return false;
  }
  
  const cpfLimpo = String(cpf).replace(/\D/g,'');

  if(cpfLimpo.length !== 11) {
    return false;
  }
  
  if(/^(\d)\1{10}$/.test(cpfLimpo)) {
    return false;
  }

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i), 10) * (10 - i);
  }

  let resto = (soma*10) % 11;
  if (resto === 10 || resto === 11) {
    resto = 0;
  }

  if (resto !== parseInt(cpfLimpo.charAt(9),10)){
    return false;
  } 

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i), 10) * (11 - i);
  }
  resto = (soma * 10) %11;

  if (resto === 10 || resto === 11) {
    resto =0;
  } 

  if (resto !== parseInt(cpfLimpo.charAt(10), 10)) {
    return false;
  }

  return true;
}



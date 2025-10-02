document.addEventListener('DOMContentLoaded', () => {
  const rows = document.querySelectorAll('tr.table-danger');
  rows.forEach(row => {
    alert(`Alerta: Préstamo vencido en fila: ${row.querySelector('td').textContent}`);
  });
});
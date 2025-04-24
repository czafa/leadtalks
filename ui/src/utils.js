export function getNumerosSelecionados() {
  const checkboxes = document.querySelectorAll(".contato-checkbox:checked");
  return Array.from(checkboxes).map(
    (cb) => cb.getAttribute("data-numero") || cb.value
  );
}

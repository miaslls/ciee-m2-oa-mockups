export function ChoiceButton({ label, selected = false, disabled = false, onClick } = {}) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'choice-button'
  button.textContent = label
  button.disabled = disabled
  button.setAttribute('aria-pressed', String(selected))
  if (selected) button.classList.add('is-selected')
  if (onClick) button.addEventListener('click', onClick)
  return button
}

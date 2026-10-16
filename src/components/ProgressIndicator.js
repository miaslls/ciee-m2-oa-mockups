export function ProgressIndicator({ current, total }) {
  const progress = document.createElement('div')
  progress.className = 'progress-indicator'
  progress.setAttribute('role', 'progressbar')
  progress.setAttribute('aria-label', 'Progresso da atividade')
  progress.setAttribute('aria-valuemin', '0')
  progress.setAttribute('aria-valuemax', String(total))
  progress.setAttribute('aria-valuenow', String(current))
  const label = document.createElement('span')
  label.textContent = `Etapa ${current} de ${total}`
  const track = document.createElement('span')
  track.className = 'progress-indicator__track'
  const fill = document.createElement('span')
  fill.className = 'progress-indicator__fill'
  fill.style.width = `${Math.min(100, Math.max(0, (current / total) * 100))}%`
  track.append(fill)
  progress.append(label, track)
  return progress
}

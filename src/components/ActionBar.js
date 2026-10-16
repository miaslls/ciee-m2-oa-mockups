export function ActionBar({ primary, secondary, navigation } = {}) {
  const bar = document.createElement('div')
  bar.className = 'action-bar'
  const start = document.createElement('div')
  start.className = 'action-bar__start'
  const end = document.createElement('div')
  end.className = 'action-bar__end'
  if (navigation) start.append(navigation)
  if (secondary) end.append(secondary)
  if (primary) end.append(primary)
  bar.append(start, end)
  return bar
}

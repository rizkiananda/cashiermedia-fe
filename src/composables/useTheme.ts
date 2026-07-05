import { ref } from 'vue'

// Kelola tema terang/gelap dengan menempelkan class .dark di <html>.
const stored = localStorage.getItem('theme')
const isDark = ref(stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches)

function apply() {
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

export function useTheme() {
  function toggle() {
    isDark.value = !isDark.value
    apply()
  }
  return { isDark, toggle, apply }
}

// Terapkan tema sedini mungkin saat modul dimuat.
apply()

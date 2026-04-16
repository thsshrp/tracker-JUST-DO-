// Вверху App.js добавь:
import HomePage from './components/HomePage/HomePage'; // (укажи правильный путь)

// А внутри роутера замени:
<Route
  path="/"
  element={<HomePage />}
/>
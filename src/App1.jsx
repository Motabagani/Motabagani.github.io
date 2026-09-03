import { useState } from 'react';
import Home from './pages/Home';
import CourseRegistrationProject from './pages/CourseRegistrationProject';
import './App.css';

function App() {
  // Simple hash-based routing (no react-router needed)
  // The URL after # determines which page shows
  const [route, setRoute] = useState(window.location.hash);

  // Listen for back/forward button and hash changes
  window.addEventListener('hashchange', () => setRoute(window.location.hash));

  // Decide which page to render
  if (route.startsWith('#/projects/course-registration')) {
    return <CourseRegistrationProject />;
  }

  return <Home />;
}

export default App;

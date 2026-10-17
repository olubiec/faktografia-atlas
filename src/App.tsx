
import { BrowserRouter, Routes, Route } from 'react-router';
import { Home } from './view/Home';
import { NotFound } from './view/NotFound';
import { InteractiveTestPage } from './view/test/InteractiveTestPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/__test/interactive" element={<InteractiveTestPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


import { BrowserRouter, Routes, Route } from 'react-router';
import { Home } from './view/Home';
import { NotFound } from './view/NotFound';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

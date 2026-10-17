import { BrowserRouter, Routes, Route } from 'react-router';
import { Home } from './view/Home';
import { NotFound } from './view/NotFound';
import { AnnotationTestPage } from './view/test/AnnotationTestPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/__test/annotation" element={<AnnotationTestPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

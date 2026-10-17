import { BrowserRouter, Routes, Route } from 'react-router';
import { Home } from './view/Home';
import { NotFound } from './view/NotFound';
import { AnnotationTestPage } from './view/test/AnnotationTestPage';
import UiTestPage from './view/test/UiTestPage';
import { InteractiveTestPage } from './view/test/InteractiveTestPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/__test/ui" element={<UiTestPage />} />
        <Route path="/__test/annotation" element={<AnnotationTestPage />} />
        <Route path="/__test/interactive" element={<InteractiveTestPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

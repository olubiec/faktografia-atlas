import { BrowserRouter, Routes, Route } from 'react-router';
import { Home } from './view/Home';
import { NotFound } from './view/NotFound';
import { About } from './view/pages/About';
import { Sources } from './view/pages/Sources';
import { Privacy } from './view/pages/Privacy';
import { Library } from './view/pages/Library';
import { AnnotationTestPage } from './view/test/AnnotationTestPage';
import UiTestPage from './view/test/UiTestPage';
import { InteractiveTestPage } from './view/test/InteractiveTestPage';
import { DesignPage } from './view/design/DesignPage';
import { ConsentBar } from './view/consent/ConsentBar';

export function App() {
  return (
    <BrowserRouter>
      <ConsentBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/o-projekcie" element={<About />} />
        <Route path="/zrodla" element={<Sources />} />
        <Route path="/prywatnosc" element={<Privacy />} />
        <Route path="/biblioteka" element={<Library />} />
        <Route path="/design" element={<DesignPage />} />
        <Route path="/__test/ui" element={<UiTestPage />} />
        <Route path="/__test/annotation" element={<AnnotationTestPage />} />
        <Route path="/__test/interactive" element={<InteractiveTestPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

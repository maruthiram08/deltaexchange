import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Story from "./pages/Story";
import Theatre from "./pages/Theatre";
import { ALL_PAGES } from "./pageRegistry";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/story/:id" element={<Story />} />
        <Route path="/watch" element={<Theatre />} />
        <Route path="/watch/:id" element={<Theatre />} />
        {ALL_PAGES.map((page) => {
          const Component = page.component;
          return <Route key={page.id} path={page.path} element={<Component />} />;
        })}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

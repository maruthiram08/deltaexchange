import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Placeholder from "./pages/Placeholder";
import { ALL_PAGES } from "./pageRegistry";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        {ALL_PAGES.map((page) => {
          const Component = page.component;
          return (
            <Route
              key={page.id}
              path={page.path}
              element={Component ? <Component /> : <Placeholder page={page} />}
            />
          );
        })}
      </Routes>
    </HashRouter>
  );
}

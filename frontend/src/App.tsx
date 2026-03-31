import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import Home from "@/pages/Home";
import CreatePage from "@/pages/Create";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <Router>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Header />
          <div className="pt-[5.5rem] md:pt-24">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreatePage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

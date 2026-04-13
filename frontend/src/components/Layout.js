import Navbar from "./Navbar";

/*
  WHY dark mode classes on Layout?
  Layout wraps every single page. By adding dark mode classes here,
  the background and text color change globally across the whole app
  when "dark" class is on <html>. Each page inherits this automatically.
*/

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;
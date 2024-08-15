import './App.css';
import './assets/css/bootstrap.min.css';
import './assets/css/style.css';
import About from "./components/about.mjs";
import Home from "./components/home.mjs";
import Clients from "./components/clients.mjs";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import Contact from "./components/contact.mjs";
import Settings from "./components/settings.mjs";
import Telegram from "./components/telegram.mjs";
import Posts from "./components/posts.mjs";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/telegram",
        element: <Telegram />
    },
    {
        path: "/clients",
        element: <Clients />
    },
    {
        path: "/posts",
        element: <Posts />
    },
    {
        path: "/settings",
        element: <Settings />,
    },
    {
        path: "/about",
        element: <About />
    },
    {
        path: "/contact",
        element: <Contact />
    },
]);
function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;

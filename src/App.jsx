import { useAppContext } from "./components/AppContext";
import Body from "./components/Body/Body";
import Header from "./components/Header/Header";
import MobileYearWrapper from "./components/Header/MobileYearWrapper";
import Logo from "./components/Logo";
import Sidebar from "./components/Sidebar";

import "./styles/App.css";


function App() {
    const { desktop, mobile } = useAppContext();

    return (
        <div className="content-layout">
            <Logo />
            <Header />
            {desktop && <Sidebar />}
            {mobile && <MobileYearWrapper />}
            <Body />
        </div>
    );
}

export default App;

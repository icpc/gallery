import { useState } from "react";

import { useAppContext } from "../AppContext";

import "../../styles/Search.css";
import "../../styles/Header.css";

const Search = () => {
    const { setText, setIsOpenMenu, desktop, mobile } = useAppContext();

    const [inputText, setInputText] = useState("");
    const set = (e) => {
        e.preventDefault();
        if (inputText !== "") {
            setText(inputText);
            setInputText("");

            if (mobile) {
                setIsOpenMenu(false);
            }
        }
    };

    return (
        <div className="search">
            <form onSubmit={set}>
                <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder="Search..."
                />
                <button type="submit">
                    {/* TODO: static SVG */}
                    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M8 0C12.4183 0 16 3.58172 16 8C16 9.8482 15.3733 11.55 14.3207 12.9045L18.2071 16.7929L16.7929 18.2071L12.9045 14.3207C11.55 15.3733 9.8482 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0ZM8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2Z"
                            fill="#8A8A8A" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default Search;

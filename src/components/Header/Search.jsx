import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";

import { useAppContext } from "../AppContext";

import "../../styles/Search.css";
import "../../styles/Header.css";

const Search = () => {
    const { setText, setIsOpenMenu, mobile } = useAppContext();

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
                    <SearchIcon color=""/>
                </button>
            </form>
        </div>
    );
};

export default Search;

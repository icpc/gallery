import React, {useContext, useState} from 'react';
import {AppContext} from "../AppContext";
import MyInput from "../UI/Input/MyInput";
import MyButton from "../UI/Button/MyButton";

const Search = () => {

    const {setText, setYear, setEvent, setTeam, setPerson} = useContext(AppContext);

    const [inputText, setInputText] = useState("");

    const set = (e) => {
        e.preventDefault()
        if (inputText !== "") {
            setText(inputText);
            setPerson("");
            setYear("");
            setEvent("");
            setTeam("");

            setInputText("");
        }
    }

    return (
        <form onSubmit={set}>
            <MyInput
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Search..."
            />
            <MyButton>Search</MyButton>
        </form>
    );
};

export default Search;
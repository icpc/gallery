import React, {useContext, useState} from 'react';
import {AppContext} from "../AppContext";
import MyInput from "../UI/Input/MyInput";
import MyButton from "../UI/Button/MyButton";

const Search = ({setSearchParams}) => {

    const {data, setData} = useContext(AppContext);

    const [inputText, setInputText] = useState("");
    console.log("header", data);
    const set = (e) => {
        e.preventDefault()
        if (inputText !== "") {
            setData({"text": inputText});

            setInputText("");
            console.log(inputText.replaceAll(" ", "%20"));
            setSearchParams({"query": inputText});
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
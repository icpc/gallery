import React, {useContext} from 'react';
import MySelect from "../UI/Select/MySelect";
import {AppContext} from "../AppContext";

const Seleclor = ({link, func, name, value, options}) => {

    const {data} = useContext(AppContext);


    return (
        <div className="selector-wrapper">
            {data.year && <MySelect options={options} onChange={func} name={name} value={value} link={link}/>}
        </div>
    );
};

export default Seleclor;
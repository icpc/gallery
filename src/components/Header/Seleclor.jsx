import React from 'react';
import MySelect from "../UI/Select/MySelect";

const Seleclor = ({link, func, name, value, options}) => {

    return (
        <div className="selector-wrapper">
            <MySelect options={options} onChange={func} name={name} value={value} link={link}/>
        </div>
    );
};

export default Seleclor;
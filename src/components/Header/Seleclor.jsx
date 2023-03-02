import React from 'react';
import MySelect from "../UI/Select/MySelect";

const Seleclor = ({leftIcon: leftIcon, func, name, value, options}) => {

    return (
        <div className="selector-wrapper">
            <MySelect options={options} onChange={func} name={name} value={value} leftIcon={leftIcon}/>
        </div>
    );
};

export default Seleclor;

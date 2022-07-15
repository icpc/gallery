import React from 'react';

const MyButton = ({children, props}) => {
    return (
        <button {...props} className="myBtn">
            {children}
        </button>
    );
};

export default MyButton;
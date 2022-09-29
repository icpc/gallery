import React from 'react';
import {LAST_YEAR} from "../consts";

const Logo = () => {
    return (
        <a href={"?album=" + LAST_YEAR}  style={{marginLeft: "1rem", marginTop: "40px", display:"flex", justifyContent:"center"}}>
            <img className={"logo"} src={process.env.PUBLIC_URL + "/icpc_header.svg"}
                 style={{height: "63px", maxWidth: "100%"}} alt={"go home page"}/></a>

    );
};

export default Logo;
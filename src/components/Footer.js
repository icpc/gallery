import React from "react";
import styled from "styled-components";
import "../styles/App.css"

const License = styled.div`
  width: 100%;
  vertical-align: middle;
  text-align: center;
  font-family: "Lucida Grande", "Lucida Sans Unicode", Verdana, Helvetica, Arial, sans-serif;
  font-size: 85%;
`;

export const Footer = ({}) => {
    return <License>
        <div>
            <hr/>
            <a rel="license" href="http://creativecommons.org/licenses/by/3.0/">
                <img alt="Creative Commons License" src="/cc.svg" width="15"/>
            </a>
            <a> ICPC Photo by </a>
            <a href="https://icpc.baylor.edu">icpc.baylor.edu</a>
            <a> is licensed under a </a>
            <a href="https://creativecommons.org/licenses/by/3.0/">Creative Commons Attribution 3.0 Unported
                License.</a>
        </div>
    </License>
}
export default Footer;
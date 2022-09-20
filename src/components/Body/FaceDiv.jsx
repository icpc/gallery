import React, {useEffect, useState} from 'react';
import styled from "styled-components";
import "../../styles/theme-variables.css"

const Rectangle = styled.fieldset`
  top: ${props => props.top * 100 + "%"};
  bottom: ${props => (100 - props.bottom * 100 - 3) + "%"};
  left: ${props => props.left * 100 + "%"};
  right: ${props => (100 - props.right * 100) + "%"};
  position: absolute;
  color: var(--colorRectangle);
  padding: 3px 6px;
  border: var(--borderRectangle) solid 3px;
  transform: rotatex(180deg);
`;


const FaceDiv = ({person, face, setFace}) => {
    const [hidden, setHidden] = useState(true);
    const FaceWrapper = styled.div`
      opacity: ${hidden ? "0" : "1"};
    `;

    useEffect(() => {
            if (face === person) {
                setHidden(false);
            } else {
                setHidden(true);
            }
        },
        [face]
    )

    return (
        <FaceWrapper onMouseLeave={() => setFace(null)} onMouseEnter={() => setFace(person)}>
            <Rectangle
                top={person?.position?.top}
                bottom={person?.position?.bottom}
                left={person?.position?.left}
                right={person?.position?.right}
                onMouseLeave={() => setFace(null)} onMouseEnter={() => setFace(person)}
            >

                <legend align="center" style={{transform: "rotatex(180deg)"}}>{person.name}</legend>
            </Rectangle>
        </FaceWrapper>
    );
};

export default FaceDiv;
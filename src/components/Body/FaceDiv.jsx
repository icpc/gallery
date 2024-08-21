import styled from "styled-components";

import "../../styles/theme-variables.css";
import "../../styles/FaceDiv.css";

const Rectangle = styled.fieldset`
  top: ${(props) => props.top * 100 + "%"};
  bottom: ${(props) => 100 - props.bottom * 100 - 3 + "%"};
  left: ${(props) => props.left * 100 + "%"};
  right: ${(props) => 100 - props.right * 100 + "%"};
  position: absolute;
  color: var(--colorRectangle);
  padding: 3px 6px;
  border: var(--borderRectangle) solid 3px;
  transform: rotatex(180deg);
`;

const FaceDiv = ({ person, hidden, setFace }) => {
  return (
    <Rectangle
      top={person?.position?.top}
      bottom={person?.position?.bottom}
      left={person?.position?.left}
      right={person?.position?.right}
      className={hidden ? "hidden" : ""}
      onMouseLeave={() => setFace(null)}
      onMouseEnter={() => setFace(person)}
    >
      <legend style={{ transform: "rotatex(180deg)" }}>{person.name}</legend>
    </Rectangle>
  );
};

export default FaceDiv;

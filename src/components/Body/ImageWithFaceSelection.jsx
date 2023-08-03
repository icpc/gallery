import { useEffect, useState } from "react";
import ReactCrop from "react-image-crop";
import { Autocomplete, Box, createFilterOptions, Paper, TextField } from "@mui/material";

import { getPeopleData } from "../../Util/DataLoader";
import { useAppContext } from "../AppContext";

import { usePhotoInfo } from "./PhotoInfo/PhotoInfoContext";
import FaceDiv from "./FaceDiv";

import "../../styles/Body.css";
import "react-image-crop/dist/ReactCrop.css";

const ImageWithFaceSelection = ({ photo, alt = "", face, setFace }) => {
    const { data } = useAppContext();
    const { photoInfo, editMode, appendPerson } = usePhotoInfo();
    const [crop, setCrop] = useState();

    const [people, setPeople] = useState([]);

    useEffect(() => {
        let isCancelled = false;

        getPeopleData(data.year)
            .then(peopleData => {
                if (!isCancelled) {
                    setPeople(peopleData);
                }
            });
        return () => {
            isCancelled = true;
        };
    }, [data.year]);

    function calculateImageSize(naturalWidth, naturalHeight) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const ratio = Math.min(screenWidth / naturalWidth, screenHeight / naturalHeight);
        return {
            width: naturalWidth * ratio,
            height: naturalHeight * ratio
        };
    }

    const { width, height } = calculateImageSize(photo.width, photo.height);

    function createPerson(name, crop) {
        if (name) {
            const person = {
                name: name,
                position: {
                    top: crop.y / height,
                    left: crop.x / width,
                    right: (crop.x + crop.width) / width,
                    bottom: (crop.y + crop.height) / height,
                }
            };
            appendPerson(person);
            setCrop(null);
        }
    }


    const filterOptions = createFilterOptions({ limit: 200 });

    return (
        <Box width={width} height={height}>
            <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                disabled={!editMode}>
                <img
                    width={width} height={height}
                    src={photo.url}
                    alt={alt}
                />
                {photoInfo?.person?.map(person => (
                    <FaceDiv
                        person={person}
                        setFace={setFace}
                        hidden={!editMode && face?.name !== person.name}
                        key={person.name + person.position.top}
                    />
                ))}
            </ReactCrop>
            {crop && crop?.height !== 0 &&
                <Paper
                    style={{
                        position: "absolute",
                        left: crop?.x,
                        top: crop?.y + crop?.height,
                        width: Math.max(crop?.width, 200),
                    }}
                    elevation={3}
                >
                    <Autocomplete
                        filterOptions={filterOptions}
                        options={people}
                        freeSolo
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Enter a name"
                            />
                        )}
                        onChange={(event, newValue) => createPerson(newValue, crop)}
                    />
                </Paper>
            }
        </Box>
    );
};

export default ImageWithFaceSelection;

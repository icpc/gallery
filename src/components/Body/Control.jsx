import React from 'react';

const Control = ({slideShow, isSlideShow, photo, handelClick}) => {
    return (
        <div className="control">
            <button className='slideshow' onClick={slideShow}>
                {!isSlideShow ?
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor"
                         className="bi bi-play" viewBox="0 0 16 16">
                        <path
                            d="M10.804 8 5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z"/>
                    </svg>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor"
                         className="bi bi-pause" viewBox="0 0 16 16">
                        <path
                            d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5zm4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5z"/>
                    </svg>
                }
            </button>
            {!isSlideShow &&
                <a className="download" href={photo.origin} target="_blank" ><svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M11 5C11 4.44772 11.4477 4 12 4C12.5523 4 13 4.44772 13 5V12.1578L16.2428 8.91501L17.657 10.3292L12.0001 15.9861L6.34326 10.3292L7.75748 8.91501L11 12.1575V5Z"
                        fill="currentColor"
                    />
                    <path
                        d="M4 14H6V18H18V14H20V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V14Z"
                        fill="currentColor"
                    />
                </svg></a>}

            <span className="dismiss" onClick={handelClick}>
                    <svg className="dismiss" onClick={handelClick} xmlns="http://www.w3.org/2000/svg" width="40" height="40"
                         fill="currentColor"
                         viewBox="0 0 16 16"> <path className="dismiss" onClick={handelClick}
                                                    d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/> </svg>
                </span>
        </div>
    );
};

export default Control;
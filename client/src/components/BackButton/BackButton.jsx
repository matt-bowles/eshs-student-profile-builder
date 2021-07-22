import React from 'react';

import Button from '@material-ui/core/Button';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';

import { useHistory } from 'react-router-dom';

export default function BackButton({ url="/" }) {

    let history = useHistory();

    return (
        <>
            <Button variant="contained" color="primary" style={{ position: "absolute", left: "20px", top: "20px" }}
                onClick={() => history.push(url) }>
                <ArrowBackIosIcon />Back
            </Button>
        </>
    );
}

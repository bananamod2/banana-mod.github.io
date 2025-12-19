import React from 'react';
import PropTypes from 'prop-types';
import Button from '../button/button.jsx';

// List of random project names
const RANDOM_NAMES = [
    'Banana Blast',
    'Pixel Adventure',
    'Mega Code',
    'Turbo Fun',
    'Crazy Scratch',
    'MerrCode Madness',
    'Block Party',
    'Code Galaxy'
];

const RandomProjectNameButton = ({ onChangedProjectTitle }) => {
    const changeName = () => {
        const randomIndex = Math.floor(Math.random() * RANDOM_NAMES.length);
        const newName = RANDOM_NAMES[randomIndex];
        onChangedProjectTitle(newName); // dispatch Redux action to change project title
    };

    return (
        <Button onClick={changeName}>
            Random Project Name
        </Button>
    );
};

RandomProjectNameButton.propTypes = {
    onChangedProjectTitle: PropTypes.func.isRequired
};

export default RandomProjectNameButton;

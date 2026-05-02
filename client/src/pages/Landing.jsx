import React from 'react';
import LandingZen from './landing/LandingZen';
import LandingGlass from './landing/LandingGlass';
import LandingOrganic from './landing/LandingOrganic';

const Landing = ({ variant }) => {
    switch (variant) {
        case 'zen':
            return <LandingZen />;
        case 'glass':
            return <LandingGlass />;
        case 'organic':
            return <LandingOrganic />;
        default:
            return <LandingZen />;
    }
};

export default Landing;

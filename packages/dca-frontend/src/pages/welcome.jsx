import React from 'react';
import { Navbar } from '@/components/navbar';
import {Hero} from '@/components/hero';
import {HowItWorks} from '@/components/howItWorks';

export const Welcome = () =>{
    return (
        <>
            <Navbar />
            <Hero/>
            <HowItWorks/>
        </>
    );
};


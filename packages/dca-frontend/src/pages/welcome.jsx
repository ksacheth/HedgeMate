import React from 'react';
import { Navbar } from '@/components/navbar';
import {Hero} from '@/components/hero';
import {HowItWorks} from '@/components/howItWorks';
import { Web3Provider } from '@/components/web3-provider';
export const Welcome = () =>{
    return (
        <Web3Provider>
            <Navbar />
            <Hero/>
            <HowItWorks/>
        </Web3Provider>
        
    );
};


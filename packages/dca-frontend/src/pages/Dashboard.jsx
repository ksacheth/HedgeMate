import React from "react";
import { Navbar } from "@/components/navbar";
import { useEffect,useState } from "react";
import HealthFactor from "@/components/HealthFactor";
import { ethers } from "ethers";
import  {getHealth} from "../utils/aave.js";
export default function Dashboard(){
    // const [address,setAddress]=useState("");
    // const [error, setError] = useState("");
    const [balance,setBalance]=useState("");
    const [health,setHealth]=useState("0");
     async function getHealthFactor() {
       try {
         const health = await getHealth();
         setHealth(health);
       } catch (err) {
         console.log(err);
       }
     }
    useEffect(()=>{
      async function getAccountDetails(){
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length != 0) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = await provider.getSigner();
          const addr = await signer.getAddress();
          //converting wei to eth
          const amt = await provider.getBalance(addr);
          const formatData=Number(ethers.formatEther(amt)).toFixed(3);
          console.log(formatData);
          setBalance(formatData);
          // setAddress(addr);
        }else{
          console.log("Not connected");
          // setError("Not connected");
        }
        getHealthFactor();
        const id = setInterval(getHealthFactor, 60000);
        return () => clearInterval(id);
      }
      getAccountDetails();
    },[]);
    return (
      <>
        <Navbar />
        <div className="py-8 ">
          <div className="pl-10 md:pl-44">
            <span className="inline-block text-indigo-600 font-extrabold text-3xl sm:text-4xl tracking-tight">
              Dashboard
            </span>
          </div>

          <div className="flex flex-wrap gap-6 mt-10 justify-center px-10 pt-10">
            <div className="flex flex-col items-start border-2 border-indigo-100 rounded-2xl w-full md:w-xl p-6  shadow-md min-h-[180px]">
              <span className="font-semibold text-xl text-gray-900 inline-block">
                MetaMask Balance
              </span>
              <span className="font-bold  text-3xl md:text-5xl text-blue-900 mt-10">
                {balance} <span className="text-2xl md:text-3xl">ETH</span>
              </span>
            </div>

            <div className="flex flex-row items-start justify-between border-2 border-indigo-100 rounded-2xl w-full md:w-xl p-6 shadow-md min-h-[180px]">
              <div className="flex flex-col ">
                <span className="font-semibold text-xl text-gray-900">Health Meter</span>
                <span className="font-bold  text-3xl md:text-5xl text-blue-900 mt-10">
                  {health}
                </span>
              </div>
              <div className="">
                <HealthFactor />
              </div>
            </div>

            <div className="flex flex-col items-start border-2 border-indigo-100 rounded-2xl w-full md:w-xl p-6 shadow-md min-h-[180px]">
              <span className="font-semibold text-xl text-gray-900">LitWallet Balance</span>
            </div>

            <div className="flex flex-col items-start border-2 border-indigo-100 rounded-2xl w-full md:w-xl p-6 shadow-md min-h-[180px]">
              <span className="font-semibold text-xl text-gray-900">MetaMask Balance</span>
            </div>
          </div>
        </div>
      </>
    );
}
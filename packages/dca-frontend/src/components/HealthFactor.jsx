import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import  {getHealth} from "../utils/aave.js";
import { useEffect,useState } from 'react';
export default function HealthFactor(){
    const [healthFactor,setHealthFactor]=useState("");
    useEffect(()=>{
        async function getHealthFactor(){
            try{
                const health=await getHealth();
                const percentage = Math.min((health/4) * 100, 100);//converting the health factor into perentage
                setHealthFactor(percentage); 
            }
            catch(err){
                console.log(err);
            }
        }
        getHealthFactor();
        const id=setInterval(getHealthFactor,60000);
        return()=>clearInterval(id);
    },[]);
    return (
      <div className="w-30 h-30 md:w-40 md:h-40">
        <CircularProgressbar value={healthFactor} strokeWidth={10} />
      </div>
    );
}
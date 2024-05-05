'use client'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'

import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import enUS from 'date-fns/locale/en-AU'
import Image from "next/image";
import "react-big-calendar/lib/css/react-big-calendar.css";
import React, { ChangeEvent, useCallback, useState  }  from 'react';
import Link from 'next/link'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import moment from 'moment'
import "./index.css"
const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface eventObject{
  id:number;
  title:string;
  start:Date;
  end:Date;
  resourceId:number;
  colorEvento:string;
  color:string;
}


interface ResourceRow{
  resourceid:string;
  resourcetitle:string;
}
/*type eventUser = {
  id: number;
  title: string;
  start: Date;
  end:Date;
  resourceId:number;
};
*/
/*type eventServer = {
  id: number;
  title: string;
  start: string;
  end:string;
  resourceId:number;
};*/
/*const decodeUser = (dto: eventServer): eventUser => {
  return {
    id: dto.id,
    title: dto.title,
    start: new Date(dto.start),
    end: new Date(dto.end),
    resourceId: dto.resourceId,
  };*/

export default  function  Page()
{
  const api=true;
  const EngID="0";
  const [resourceMap,setResourceMap] = useState<ResourceRow[]>([]);
  const [engineers,setEngineers] = useState<ResourceRow[]>([]);
  const [engineerID,setEngineerID] = useState(EngID);
  const [date,setDate]=useState(new Date());
  const [events,setEvents] = useState<eventObject[]>([]);//repairList
  

 
    React.useEffect(()=>{
      fetchEngineer();
      
    },[]);

    const fetchEngineer = async()=>{
    

      const endpoint = (api)?'https://diapi.icyforest-7eae763b.australiaeast.azurecontainerapps.io/api/TechEngineerForDiary/{id}?EngineerID='+EngID: '/data-api/rest/TechEngineerForDiary?EngineerID='+EngID;
      const response = await fetch(endpoint);
      console.log(endpoint);
      const data = await response.json();
      const result = (api)?data:data.value;
      setEngineers(result);
      //setResourceMap(result.filter((e:ResourceRow) => e.resourceid==EngID));
      if (EngID=="0")
        {
          setResourceMap(result);
        }
        else
        {
          setResourceMap(result.filter((e:ResourceRow) => e.resourceid==EngID));
        }
      fetchTechScheduler(EngID.toString(),date);
   }
    const fetchTechScheduler = async(engid:string,dte:Date)=>{
      try{
        console.log(engid);
      const endpoint =  (api)?'https://diapi.icyforest-7eae763b.australiaeast.azurecontainerapps.io/api/TechScheduler/{id}/'+dte.getFullYear().toString()+'-'+(dte.getMonth()+1).toString() +'-'+dte.getDate().toString()+'?EngineerID='+engid:'/data-api/rest/TechScheduler?EngineerID='+engid;

      console.log(endpoint);
      const response = await fetch(endpoint);
      const data = await response.json();
      const result = (api)?data:data.value;
      if (result==null)
        {
          setEvents([]);
          return;
        }
      let myevent: eventObject[] = [];
      for(let i=0;i<result.length ;i++)
        {
          myevent.push({color:result[i].color,colorEvento:result[i].colorevento,id:result[i].id,title:result[i].title,start:new Date(result[i].start),end:new Date(result[i].end),resourceId:result[i].resourceid});
        }

      console.table(myevent);
      setEvents(myevent);
      }
      catch (error)
      {
        console.error('Error: '+error)
      }
    }

    const engChange = (event: ChangeEvent<HTMLSelectElement>) => { // <----- here we assign event to ChangeEvent
      
      console.log(event.target.value); // Example: Log the value of the selected option
      setEngineerID(event.target.value);
      fetchTechScheduler(event.target.value,date);
      if (event.target.value=="0")
        {
          setResourceMap(engineers);
        }
        else
        {
          setResourceMap(engineers.filter(e => e.resourceid==event.target.value));
        }
    };



   /*
   <div>
<select  onChange={engChange}>
      <option key='0' value='0'>All</option>
        {engineers.map((eng, index) => {
      return (
        <option key={eng.resourceid} value={eng.resourceid} selected={eng.resourceid==engineerID}>
          {eng.resourcetitle}
        </option>
      );
      
    })}
        </select>
  </div>
  */
/*
  <Image alt="Tech Interface - Equipment Service Repair" layout="fill" objectFit="cover" src="/white.jpg"/>
      */



const updateDate = (dte:Date)=>{

  setDate(dte);
  console.log(dte);
  fetchTechScheduler(EngID.toString(),dte);
}
//const [view,setView]=useState<Views>(Views.WEEK);
//const OnNextClick = useCallback(()=>{
    //if (view==Views.DAY) 
     ;// setDate(moment(date).add(7,'d').toDate());
    //setView(Views.DAY);
//},[])
    return (
      <>
        
        <div className="App">
       <Calendar
      selectable={true}
      onSelectSlot={(slot) => {
        console.log("slot select: ", slot);
        //selectDayMobile(slot);
      }}
      onSelectEvent={(eventObject)=>{
          console.log('hyperlink');
          console.log(eventObject.id);
          const ideng= eventObject.id.toString().split("~");
          console.log(ideng[0]);
          const link = "https://dentalinstallations.azurewebsites.net/Service/Edit/"+ideng[0].toString()+"?BranchID=2";
         // const navigate = useNavigate();
          //navigate(link, { replace: false });
          //window.parent.location.path=link;
          window.top?.location.replace(link);
      }}  
       style={{ height: '100%' }}
        defaultView='day'
        resourceIdAccessor="resourceid"
        resourceTitleAccessor="resourcetitle"
        views={['week','agenda','day']}
       
        localizer={localizer}
        events={events}
        min={moment("2024-10-10T07:00:00").toDate()}
        max={moment("2024-10-10T18:00:00").toDate()}
        resources={resourceMap}

        date={date}

   
        onNavigate={dte => {
          updateDate(dte);
          
        }}
          eventPropGetter={(events) => {
            const backgroundColor = events.colorEvento ? events.colorEvento : 'blue';
            const color = events.color ? events.color : 'blue';
            return { style: { backgroundColor ,color} }
          }}
      />
    </div>
    </>
    );
}



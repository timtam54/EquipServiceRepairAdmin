'use client'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import { useSearchParams } from "next/navigation";
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import enUS from 'date-fns/locale/en-AU'
import { Circles } from 'react-loader-spinner'
import "react-big-calendar/lib/css/react-big-calendar.css";
import React, { ChangeEvent, useCallback, useState  }  from 'react';
import WeekdaysView from "../components/WeekdaysView";

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

export default  function  Page()
{
  const api=true;
  const EngID="0";
  const [resourceMap,setResourceMap] = useState<ResourceRow[]>([]);
  const [engineers,setEngineers] = useState<ResourceRow[]>([]);
  const [engineerID,setEngineerID] = useState(EngID);
  const searchParams = useSearchParams();
  const spd=searchParams.get("dte");
  const startdate = (spd==null)?new Date():new Date(spd!.toString());
  const [date,setDate]=useState(startdate);
  const [events,setEvents] = useState<eventObject[]>([]);//repairList
  
  const FormatDate=(date:any)=>  {
    if (date==null) return "";
   const dte= new Date(date);
    return dte.getFullYear().toString()+'-'+(dte.getMonth()+1).toString().padStart(2, '0')+'-'+(dte.getDate()).toString().padStart(2, '0');
  }
    React.useEffect(()=>{
      fetchEngineer();
      
    },[]);
    const Mon=moment().weekday( 1 );
    const Tue=moment().weekday( 2 );
    const Wed=moment().weekday( 3);
    const Thu=moment().weekday( 4 );
    const Fri=moment().weekday( 5 );
    const fetchEngineer = async()=>{
    
      const endpoint = (api)?'https://diapi.icyforest-7eae763b.australiaeast.azurecontainerapps.io/api/TechEngineerForDiary/{id}?EngineerID='+EngID: '/data-api/rest/TechEngineerForDiary?EngineerID='+EngID;
      console.log(endpoint);
      const response = await fetch(endpoint);
    
      const data = await response.json();
      const result = (api)?data:data.value;
      setEngineers(result);
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
      let myevent = [];
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
      setLoading(false);
    }

    const engChange = (event: ChangeEvent<HTMLSelectElement>)=> { // <----- here we assign event to ChangeEvent  
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
const [loading,setLoading] = useState(true);

return ( loading ? 

  <div className="relative h-16">
     <div className="absolute p-4 text-center transform -translate-x-1/2 border left-1/2">
        <Circles
      height="200"
      width="200"

      color="navy"
      ariaLabel="circles-loading"
      wrapperStyle={{}}
      wrapperClass=""
      visible={true}
    />  </div>
    </div>
    :
      <>
        <div style={{display:'flex',justifyContent:'space-between',alignItems: 'center'}}>
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems: 'center'}}>
              <div></div>
              {FormatDate(Mon)}
              <div></div>
          </div>
          <Calendar
          toolbar={false}
          selectable={true}
       onSelectSlot={(slot) => {
         console.log("slot select: ", slot);
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
        style={{ height: '980px' }}
    
         resourceIdAccessor="resourceid"
         resourceTitleAccessor="resourcetitle"
        

         views={{ day: true}}
 
         localizer={localizer}
         events={events}
          defaultView="day"
         min={moment("2024-06-24T07:00:00").toDate()}
         max={moment("2024-06-28T18:00:00").toDate()}
         resources={resourceMap}
  
         date={Mon.toString()}
 
    
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
          <div>           
             <div style={{display:'flex',justifyContent:'space-between',alignItems: 'center'}}>
              <div></div>
              {FormatDate(Tue)}
              <div></div>
          </div>
          <Calendar
          toolbar={false}
          selectable={true}
       onSelectSlot={(slot) => {
         console.log("slot select: ", slot);
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
        style={{ height: '980px' }}
    
         resourceIdAccessor="resourceid"
         resourceTitleAccessor="resourcetitle"
        

         views={{ day: true}}
 
         localizer={localizer}
         events={events}
          defaultView="day"
         min={moment("2024-06-24T07:00:00").toDate()}
         max={moment("2024-06-28T18:00:00").toDate()}
         resources={resourceMap}
  
         date={Tue.toString()}
 
    
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
          <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems: 'center'}}>
              <div></div>
              {FormatDate(Wed)}
              <div></div>
          </div>
          <Calendar
          toolbar={false}
       selectable={true}
       onSelectSlot={(slot) => {
         console.log("slot select: ", slot);
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
        style={{ height: '980px' }}
    
         resourceIdAccessor="resourceid"
         resourceTitleAccessor="resourcetitle"
        

         views={{ day: true}}
 
         localizer={localizer}
         events={events}
          defaultView="day"
         min={moment("2020-01-01T07:00:00").toDate()}
         max={moment("2030-06-28T18:00:00").toDate()}
         resources={resourceMap}
  
         date={Wed.toString()}
 
    
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
          <div>            <div style={{display:'flex',justifyContent:'space-between',alignItems: 'center'}}>
              <div></div>
              {FormatDate(Thu)}
              <div></div>
          </div>
          <Calendar
          toolbar={false}
       
       selectable={true}
       onSelectSlot={(slot) => {
         console.log("slot select: ", slot);
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
        style={{ height: '980px' }}
    
         resourceIdAccessor="resourceid"
         resourceTitleAccessor="resourcetitle"
        

         views={{ day: true}}
 
         localizer={localizer}
         events={events}
          defaultView="day"
         min={moment("2024-06-24T07:00:00").toDate()}
         max={moment("2024-06-28T18:00:00").toDate()}
         resources={resourceMap}
  
         date={Thu.toString()}
 
    
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
          <div>            <div style={{display:'flex',justifyContent:'space-between',alignItems: 'center'}}>
              <div></div>
              {FormatDate(Fri)}
              <div></div>
          </div>
          <Calendar
          toolbar={false}
       selectable={true}
       onSelectSlot={(slot) => {
         console.log("slot select: ", slot);
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
        style={{ height: '980px' }}
    
         resourceIdAccessor="resourceid"
         resourceTitleAccessor="resourcetitle"
        

         views={{ day: true}}
 
         localizer={localizer}
         events={events}
          defaultView="day"
         min={moment("2024-06-24T07:00:00").toDate()}
         max={moment("2024-06-28T18:00:00").toDate()}
         resources={resourceMap}
  
         date={Fri.toString()}
 
    
         onNavigate={dte => {
           updateDate(dte);
           
         }}
           eventPropGetter={(events) => {
             const backgroundColor = events.colorEvento ? events.colorEvento : 'blue';
             const color = events.color ? events.color : 'blue';
             return { style: { backgroundColor ,color} }
           }}
       /></div>
        </div>
     
    </>
    );
}

/*
   <div className="App">

     
        
          <Calendar
          view="work_week"
          toolbar={false}
      selectable={true}
      onSelectSlot={(slot) => {
        console.log("slot select: ", slot);
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
       style={{ height: '1000px' }}
   
        resourceIdAccessor="resourceid"
        resourceTitleAccessor="resourcetitle"
       
        
        views={{ day: true, week: true, work_week:true }}

        localizer={localizer}
        events={events}
         defaultView="day"
        min={moment("2024-06-24T07:00:00").toDate()}
        max={moment("2024-06-28T18:00:00").toDate()}
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
*/
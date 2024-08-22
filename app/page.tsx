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
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import moment from 'moment'
import "./index.css"
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import Button from '@mui/material/Button';
import MapIcon from '@mui/icons-material/Map';
import GridOnIcon from '@mui/icons-material/GridOn';
import CustomerLocationSearch from '@/components/customerLocationSearch'
import SearchIcon from '@mui/icons-material/Search';
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

interface techsched{
  id:number;
  title:string;
  start:Date;
  end:Date;
  resourceid:number;
  colorevento:string;
  color:string;
  lat:number;
  lon:number;
}
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
interface latlon{
  lat:number;
  lng:number;
  title:string;
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
  const brobj=searchParams.get("branchid")??"2";
  //const [branchid,setBranchid]=useState(parseInt(brobj));
  const startdate = (spd==null)?new Date():new Date(spd!.toString());
  const [date,setDate]=useState(startdate);
  const [events,setEvents] = useState<eventObject[]>([]);//repairList
  
  const FormatDate=(date:any)=>  {
    if (date==null) return "";
   const dte =new Date(date);
    return dte.getFullYear().toString()+'-'+(dte.getMonth()+1).toString().padStart(2, '0')+'-'+(dte.getDate()).toString().padStart(2, '0');
  }
    React.useEffect(()=>{
      fetchEngineer();
      
    },[]);
    const [Mon,setMon]=useState(moment().weekday(1).toDate());
    const [Tue,setTue]=useState(moment().weekday(2).toDate());
    const [Wed,setWed]=useState(moment().weekday(3).toDate());
    const [Thu,setThu]=useState(moment().weekday(4).toDate());
    const [Fri,setFri]=useState(moment().weekday(5).toDate());

    const prev=()=>{
      var mmon = moment(Mon);
      mmon.subtract(7,'d');
      setMon(mmon.toDate());
      
      var mtue = moment(Tue);
      mtue.subtract(7,'d');
      setTue(mtue.toDate());

      var mwed = moment(Wed);
      mwed.subtract(7,'d');
      setWed(mwed.toDate());

      var mthu = moment(Thu);
      mthu.subtract(7,'d');
      setThu(mthu.toDate());

      var mfri = moment(Fri);
      mfri.subtract(7,'d');
      setFri(mfri.toDate());

      var tt=moment(date);//-7;
      tt.subtract(7,'d');
      setDate(tt.toDate());
     // alert(tt.toDate());
      fetchTechScheduler(EngID.toString(),tt.toDate(),resourceMap);
    }
    const next=()=>{
      var mmon = moment(Mon);
      mmon.add(7,'d');
      setMon(mmon.toDate());
      
      var mtue = moment(Tue);
      mtue.add(7,'d');
      setTue(mtue.toDate());

      var mwed = moment(Wed);
      mwed.add(7,'d');
      setWed(mwed.toDate());

      var mthu = moment(Thu);
      mthu.add(7,'d');
      setThu(mthu.toDate());

      var mfri = moment(Fri);
      mfri.add(7,'d');
      setFri(mfri.toDate());

      var tt=moment(date);//-7;
      tt.add(7,'d');
      setDate(tt.toDate());

      fetchTechScheduler(EngID.toString(),tt.toDate(),resourceMap);
    }
    const fetchEngineer = async()=>{
    
      const endpoint = process.env.NEXT_PUBLIC_MDSAPI+'TechEngineerForDiary/{id}?BranchID='+brobj;//: '/data-api/rest/TechEngineerForDiary?EngineerID='+EngID;
      console.log(endpoint);
      const response = await fetch(endpoint);
    
      const data = await response.json();
      const result = (api)?data:data.value;
      setEngineers(result);

      if (EngID=="0")
        {
          const xxx=result.filter((ii:ResourceRow)=>ii.resourcetitle!='Admin / Sales');
          //setResourceMap(xxx);
          fetchTechScheduler(EngID.toString(),date,xxx);
        }
        else
        {
          const xxx=result.filter((e:ResourceRow) => e.resourceid==EngID);
         // setResourceMap(xxx);
          fetchTechScheduler(EngID,date,xxx);
        }
     // fetchTechScheduler(EngID.toString(),date);
   }

   var running=false;
    const fetchTechScheduler = async(engid:string,dte:Date,rm:ResourceRow[])=>{
      if (running)
      {
        return;
      }
      running=true;
      //alert('fetchTechScheduler');
      try{
        console.log(engid);
      const endpoint = process.env.NEXT_PUBLIC_MDSAPI+'TechScheduler/{id}/'+brobj+'/'+dte.getFullYear().toString()+'-'+(dte.getMonth()+1).toString() +'-'+dte.getDate().toString()+'?EngineerID='+engid;

      console.log(endpoint);
      const response = await fetch(endpoint);
      const data = await response.json();
      const result:techsched[] = (api)?data:data.value;
      SetLocsLatLon(result);
      if (result==null)
        {
          setEvents([]);
          return;
        }
      let myevent = [];
      var myres:ResourceRow[] = [];
      

      for(let i=0;i<result.length ;i++)
        {
          myevent.push({color:result[i].color,colorEvento:result[i].colorevento,id:result[i].id,title:result[i].title,start:new Date(result[i].start),end:new Date(result[i].end),resourceId:result[i].resourceid});
        }
        console.table(myevent);
        setEvents(myevent);
        console.table(rm);
        for(let i=0;i<rm.length ;i++)
        {
            if (result.filter(j=>j.resourceid==parseInt(rm[i].resourceid)).length==0)
            {
              ;//alert(rm[i].resourceid + ' not found in result resourceId');

            }
            else
            {
             // alert(rm[i].resourceid + ' IS found in result resourceId');
              const eng = rm.filter(j=>j.resourceid==rm[i].resourceid);
              if (eng.length==0)
              {
                alert(rm[i].resourceid);
              }
              else
              {
              const engname = eng[0].resourcetitle;
              //alert('found'+result[i].resourceid + ' ' + engname);
              myres.push({resourceid:rm[i].resourceid,resourcetitle:engname});
              }
            }   
        }
        console.table(myres);
        setResourceMap(myres);
/*resourceid:string;
resourcetitle:string;*/
    
      }
      catch (error)
      {
        console.error('Error: '+error)
      }
      setLoading(false);
      running=false;
    }

    
    const [center,setCenter] = useState<latlon>();
        const [locations,setLocations] = useState<latlon[]>([]); 
        const SetLocsLatLon=(jbs:techsched[])=>
          {
            let unique:latlon[] = [];
            let glocs:latlon[] = [];
            
            let sumlat=0;
            let sumlon=0;
            let cnt=0;
            jbs.forEach((element:techsched) => {
            
              glocs.push({lat: element.lat, lng:  element.lon,title:element.title})
  
                const el:latlon={lat:element.lat,lng:element.lon,title:element.title };
  
                  if (unique.filter(i=>i.title==element.title).length==0)
                  {
  
                    unique.push(el);
                    if (el.lat!=null && el.lng!=null)
                      {
                    sumlat+=el.lat;
                    console.log(el.lat);
                    sumlon+=el.lng;
             
                    cnt+=1;
                      }
                  }     
            });
            setLocations(glocs);
            const lati=sumlat/cnt;
            console.log('avg lat:'+lati.toString());
            const loni=sumlon/cnt;
            console.log('avg lon:'+loni.toString());
            setCenter({lat:lati,lng:loni,title:'center'});
          }
          const containerStyle = {
            width: '100%',
            height: '600px'
          };

  const updateDate = (dte:Date)=>{

  setDate(dte);
  console.log(dte);
  fetchTechScheduler(EngID.toString(),dte,resourceMap);
}
const [grid,setGrid]=useState(true);
const [loading,setLoading] = useState(true);
const [isModalOpen, setIsModalOpen] = useState(false);

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
     {isModalOpen && <CustomerLocationSearch
        closeModal={()=>{setIsModalOpen(false);setGrid(true);}}
      />}
        {grid && <div style={{display:'flex',justifyContent:'space-between',alignItems: 'center'}}>
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems: 'center'}}>
              <div><button style={{color:'red'}} onClick={(e)=>{e.preventDefault();prev();}}><FastRewindIcon style={{fontSize:'36px'}} /></button> </div>
              <Button style={{backgroundColor:'white',color:'#0690B1'}} variant="outlined"onClick={(e)=>{e.preventDefault();setGrid(false);setIsModalOpen(true);}}><SearchIcon/>Search Customer Location</Button>
     
              <Button style={{backgroundColor:grid?'white':'yellow',color:'#0690B1'}} variant="outlined" onClick={(e)=>{e.preventDefault();setGrid(false)}}><MapIcon/>Map</Button>
              <b>Mon</b>{FormatDate(Mon)}
              <div><button style={{color:'red'}} onClick={(e)=>{e.preventDefault();next();}}><FastForwardIcon style={{fontSize:'36px'}}/></button> </div>
              <div></div>
          </div>
          <Calendar
          
          toolbar={false}
          selectable={true}
       onSelectSlot={(slot:any) => {
         console.log("slot select: ", slot);
       }}
       onSelectEvent={(eventObject:any)=>{
           console.log('hyperlink');
           console.log(eventObject.id);
           const ideng= eventObject.id.toString().split("~");
           console.log(ideng[0]);
           const link = process.env.NEXT_PUBLIC_WEB+ "Service/Edit/"+ideng[0].toString()+"?BranchID="+brobj;

           window.top?.location.replace(link);
       }}  
        style={{  height: '980px' }}
    
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
         onNavigate={(dte:any) => {
           updateDate(dte);
           
         }}
           eventPropGetter={(events:any) => {
             const backgroundColor = events.colorEvento ? events.colorEvento : 'blue';
             const color = events.color ? events.color : 'blue';
             return { style: { backgroundColor ,color} }
          }}
        />
          </div>
          <div>           
             <div style={{display:'flex',justifyContent:'space-between',alignItems: 'center'}}>
              <div></div>
              <div><button style={{color:'red'}} onClick={(e)=>{e.preventDefault();prev();}}><FastRewindIcon style={{fontSize:'36px'}} /></button> </div>
              <b>Tue</b>{FormatDate(Tue)}
              <div><button style={{color:'red'}} onClick={(e)=>{e.preventDefault();next();}}><FastForwardIcon style={{fontSize:'36px'}}/></button> </div>
              <div></div>
          </div>
          <Calendar
          toolbar={false}
          selectable={true}
       onSelectSlot={(slot:any) => {
         console.log("slot select: ", slot);
       }}
       onSelectEvent={(eventObject:any)=>{
           console.log('hyperlink');
           console.log(eventObject.id);
           const ideng= eventObject.id.toString().split("~");
           console.log(ideng[0]);
           const link = process.env.NEXT_PUBLIC_WEB+ "Service/Edit/"+ideng[0].toString()+"?BranchID="+brobj;
           window.top?.location.replace(link);
       }}  
        style={{ height:'980px'}}
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
 
    
         onNavigate={(dte:any) => {
           updateDate(dte);
           
         }}
           eventPropGetter={(events:any) => {
             const backgroundColor = events.colorEvento ? events.colorEvento : 'blue';
             const color = events.color ? events.color : 'blue';
             return { style: { backgroundColor ,color} }
          }}
        />
        </div>
          <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems: 'center'}}>
              <div></div>
              <div><button style={{color:'red'}} onClick={(e)=>{e.preventDefault();prev();}}><FastRewindIcon style={{fontSize:'36px'}} /></button> </div>
             <b>Wed</b>{FormatDate(Wed)}
             <div><button style={{color:'red'}} onClick={(e)=>{e.preventDefault();next();}}><FastForwardIcon style={{fontSize:'36px'}}/></button> </div>
             <div></div>
          </div>
          <Calendar
          toolbar={false}
       selectable={true}
       onSelectSlot={(slot:any) => {
         console.log("slot select: ", slot);
       }}
       onSelectEvent={(eventObject:any)=>{
           console.log('hyperlink');
           console.log(eventObject.id);
           const ideng= eventObject.id.toString().split("~");
           console.log(ideng[0]);
           const link = process.env.NEXT_PUBLIC_WEB+ "Service/Edit/"+ideng[0].toString()+"?BranchID="+brobj;
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
 
    
         onNavigate={(dte:any) => {
           updateDate(dte);
           
         }}
           eventPropGetter={(events:any) => {
             const backgroundColor = events.colorEvento ? events.colorEvento : 'blue';
             const color = events.color ? events.color : 'blue';
             return { style: { backgroundColor ,color} }
           }}
       />
       </div>
          <div>            <div style={{display:'flex',justifyContent:'space-between',alignItems: 'center'}}>
              <div></div>
              <div><button style={{color:'red'}} onClick={(e)=>{e.preventDefault();prev();}}><FastRewindIcon style={{fontSize:'36px'}} /></button> </div>
              <b>Thu</b>{FormatDate(Thu)}
              <div><button style={{color:'red'}} onClick={(e)=>{e.preventDefault();next();}}><FastForwardIcon style={{fontSize:'36px'}}/></button> </div>
           <div></div>
          </div>
          <Calendar
          toolbar={false}
       
       selectable={true}
       onSelectSlot={(slot:any) => {
         console.log("slot select: ", slot);
       }}
       onSelectEvent={(eventObject:any)=>{
           console.log('hyperlink');
           console.log(eventObject.id);
           const ideng= eventObject.id.toString().split("~");
           console.log(ideng[0]);
           const link = process.env.NEXT_PUBLIC_WEB+ "Service/Edit/"+ideng[0].toString()+"?BranchID="+brobj;
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
 
    
         onNavigate={(dte:any) => {
           updateDate(dte);
           
         }}
           eventPropGetter={(events:any) => {
             const backgroundColor = events.colorEvento ? events.colorEvento : 'blue';
             const color = events.color ? events.color : 'blue';
             return { style: { backgroundColor ,color} }
           }}
       />
       </div>
          <div>     
                 <div style={{display:'flex',justifyContent:'space-between',alignItems: 'center'}}>
              <div></div>
              <div><button style={{color:'red'}} onClick={(e)=>{e.preventDefault();prev();}}><FastRewindIcon style={{fontSize:'36px'}} /></button> </div>
              <b>Fri</b>{FormatDate(Fri)}
              <div><button style={{color:'red'}} onClick={(e)=>{e.preventDefault();next();}}><FastForwardIcon style={{fontSize:'36px'}}/></button> </div>
       
              <div></div>

          </div>
          <Calendar
          toolbar={false}
       selectable={true}
       onSelectSlot={(slot:any) => {
         console.log("slot select: ", slot);
       }}
       onSelectEvent={(eventObject:any)=>{
           console.log('hyperlink');
           console.log(eventObject.id);
           const ideng= eventObject.id.toString().split("~");
           console.log(ideng[0]);
           const link = process.env.NEXT_PUBLIC_WEB+ "Service/Edit/"+ideng[0].toString()+"?BranchID="+brobj;
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
 
    
         onNavigate={(dte:any) => {
           updateDate(dte);
           
         }}
           eventPropGetter={(events:any) => {
             const backgroundColor = events.colorEvento ? events.colorEvento : 'blue';
             const color = events.color ? events.color : 'blue';
             return { style: { backgroundColor ,color} }
           }}/>
       </div>

       <div>     
                 <div style={{display:'flex',justifyContent:'space-between',alignItems: 'center'}}>
              <div></div>
              <b style={{color:'orange'}} >Unscheduled</b>
             
              <div></div>

          </div>
          <Calendar
          toolbar={false}
       selectable={true}
       onSelectSlot={(slot:any) => {
         console.log("slot select: ", slot);
       }}
       onSelectEvent={(eventObject:any)=>{
           console.log('hyperlink');
           console.log(eventObject.id);
           const ideng= eventObject.id.toString().split("~");
           console.log(ideng[0]);
           const link = process.env.NEXT_PUBLIC_WEB+ "Service/Edit/"+ideng[0].toString()+"?BranchID=" + brobj;
           window.top?.location.replace(link);
       }}  
        style={{ height: '980px'}}
    
         resourceIdAccessor="resourceid"
         resourceTitleAccessor="resourcetitle"
        

         views={{ day: true}}
 
         localizer={localizer}
         events={events}
          defaultView="day"
         min={moment("2024-06-24T07:00:00").toDate()}
         max={moment("2024-06-28T07:00:00").toDate()}

  
         date={'2000/1/1'}
 
 
           eventPropGetter={(events:any) => {
             const backgroundColor = events.colorEvento ? events.colorEvento : 'blue';
             const color = events.color ? events.color : 'blue';
             return { style: { backgroundColor ,color} }
           }}/>
       </div>

        </div>}
        {!grid && 
     
        <div>
               <Button style={{backgroundColor:grid?'yellow':'white',color:'#0690B1'}} variant="outlined" onClick={(e)=>{e.preventDefault();setGrid(true)}}><GridOnIcon/>Diary</Button>
   
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API!}>
      <GoogleMap 
        mapContainerStyle={containerStyle}
        center={center}
        zoom={8}>
 {locations.map((location, index) => (
          <Marker key={index} title={location.title} position={location} clickable={true} draggable={true}  />
        ))}
      </GoogleMap>
    </LoadScript>
    </div>
  }
    </>
    );
}


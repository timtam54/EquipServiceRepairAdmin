import React, { useState, useEffect } from 'react';
import "@/components/part.css";
import { Button} from "@mui/material";
import DataTable, { TableColumn } from "react-data-table-component";
import { Circles } from 'react-loader-spinner'
import MapIcon from '@mui/icons-material/Map';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import GridOnIcon from '@mui/icons-material/GridOn';
interface CustomerLocation {
    customercode: string;
    companyname?: string;
    deptid?: number;
    department?: string;
    lat?: number;
    lon?: number;
    location?: string;
    locationid?: number;
    physicaladdress?: string;
    
}
interface latlon{
  lat:number;
  lng:number;
  title:string;
}
interface Job {
  lat?: number;
  lon?: number;
  id: number;
  deptid?: number;
  sr?: string;
  mapaddress?: string;
  customer?: string;
  jobno?: string;
  equipment?: string;
  customerid?: string;
  location?: string;
  moreinfo?: string;
  engineername?: string;
  distance?: number;
  scheduleddate?: Date;
}
type Props = {
    closeModal:  () => void;
}
export default function CustomerLocationSearch({closeModal}:Props)
{
  const [grid,setGrid]=useState(true);
    const [locations, setLocations] = useState<CustomerLocation[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [data, setData] = useState<Job[]>([]);
    useEffect(() => {
        fetchData('~')
    }, []);

    const fetchData=async(search:string)=>
    {setLoading(true);
      fetch('https://diapi.icyforest-7eae763b.australiaeast.azurecontainerapps.io/api/CustomerDeptLocation/'+search+'/2')
      //fetch('https://diapi.icyforest-7eae763b.australiaeast.azurecontainerapps.io/api/CustomerDeptLocation/'+search+'/2')
            .then(response => response.json())
            .then(data => setLocations(data))
            .then(data=>setLoading(false))
            .catch(error => console.error(error));
           // setLoading(false);
    }
    const [loc,setLoc]=useState('');
    
    const newloc=(locs:string,lat:number,lon:number)=>{
      setLoading(true);
      setLoc(locs)
      fetch('https://diapi.icyforest-7eae763b.australiaeast.azurecontainerapps.io/api/JobsNearby/'+lat.toString()+'/'+lon.toString())//locs
      .then(response => response.json())
      
      .then(data=>SetLocsLatLon(data))
      .then(()=>setLoading(false))
      
    //  .then(setLoading(false))
      .catch(error => console.error(error));
   //   ;
      
    }
    const columns: TableColumn<CustomerLocation>[] = [
      {
        name:'Company',
        sortable: true,
        width: "200px", 
         cell:  (row:CustomerLocation) =>row.companyname,
         selector:  (row:CustomerLocation) =>row.companyname!          
      } ,
      {
        name:'Dept',
        sortable: true,
        width: "100px", 
         cell:  (row:CustomerLocation) =>row.department,
         selector:  (row:CustomerLocation) =>row.department??''          
      } ,
      {
        name:'Address',
        sortable: true,
        width: "400px", 
         cell:  (row:CustomerLocation) =><button onClick={(e)=>{e.preventDefault();newloc(row.physicaladdress??'',row.lat??0,row.lon??0)}}><u>{row.physicaladdress}</u></button>,
         selector:  (row:CustomerLocation) =>row.physicaladdress??''          
      } ,
      
      {
          name:'Location',
          sortable: true,
          width: "100px", 
        
          cell  : (row:CustomerLocation) =>row.location,
          selector: (row:CustomerLocation) => row.location ?? '',
        }
        ,
        {
          name:'Lon',
          sortable: true,
          width: "100px", 
        
          cell  : (row:CustomerLocation) =>row.lon,
          selector: (row:CustomerLocation) => row.lon ?? '',
        }
        ,    

        {
          name:'Lat',
          sortable: true,
          width: "110px", 
        
          cell  : (row:CustomerLocation) =>row.lat,
          selector: (row:CustomerLocation) => row.lat ?? '',
        }
        
    ]
    const DateFormat=(date:any)=>  {
      if (date==null) return "";
     const dte= new Date(date);
      return dte.getFullYear().toString()+'-'+(dte.getMonth()+1).toString().padStart(2,'0')+'-'+(dte.getDate()).toString().padStart(2,'0');
    }
    const [loading,setLoading]=useState(false);
    const columnsnearest: TableColumn<Job>[] = [
      {
        name:'jobno',
        sortable: true,
        width: "200px", 
         cell:  (row:Job) =>row.jobno??'',
         selector:  (row:Job) =>(row.jobno) ??''      
      } ,{
        name:'Date',
        sortable: true,
        width: "200px", 
         cell:  (row:Job) =>DateFormat(row.scheduleddate),
         selector:  (row:Job) =>DateFormat(row.scheduleddate)       
      } ,
      {
        name:'Address',
        sortable: true,
        width: "400px", 
         cell:  (row:Job) =>row.mapaddress,
         selector:  (row:Job) =>row.mapaddress??''          
      } ,
      {
        name:'engineername',
        sortable: true,
        width: "150px", 
         cell:  (row:Job) =>row.engineername,
         selector:  (row:Job) =>row.engineername??''          
      }
    ]
    const customStyles = {
        headCells: {
          style: {
            paddingLeft: '4px', // override the cell padding for head cells
            paddingRight: '4px',
            fontSize: 'medium',
            fontWeight: 'bold',
            color:'Black'
          },
        },
        cells: {
          style: {
            paddingLeft: '4px', // override the cell padding for data cells
            paddingRight: '4px',
          },
        },
      }
      const [locs,setLocs] = useState<latlon[]>([]); 
      const [search,setSearch]=useState("");
      const [center,setCenter] = useState<latlon>();

      const SetLocsLatLon=(jbs:Job[])=>
        {
          setData(jbs)
          let unique:latlon[] = [];
          let glocs:latlon[] = [];
          
          let sumlat=0;
          let sumlon=0;
          let cnt=0;
          jbs.forEach((element:Job) => {
          
            glocs.push({lat: element.lat!, lng:  element.lon!,title:element.jobno!})

              const el:latlon={lat:element.lat!,lng:element.lon!,title:element.jobno! };

                if (unique.filter(i=>i.title==element.jobno).length==0)
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
          setLocs(glocs);
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
    return ( loading ? 

      <div className="relative h-16">
         <div className="absolute p-4 text-center transform -translate-x-1/2 border left-1/2">
            <Circles
          height="200"
          width="200"

          color={'#'+process.env.NEXT_PUBLIC_COLOUR1}
          ariaLabel="circles-loading"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
        />  </div>
        </div>
        :
        <div className="modal-container">
        <div className="modal" style={{backgroundColor:'#0690B1',color:'white',width:'1100px'}} >
          <div style={{display:'flex'}}>
      <h1 style={{fontSize:'24px',fontWeight:'bold'}}>Customer Location</h1>
      <Button type="submit" style={{color:'white',borderColor:'white'}} variant="outlined" onClick={(e)=>{e.preventDefault();closeModal()}}>Close</Button>
      {loc==''?<input type="text" placeholder="Search..." style={{color:'black'}} value={search} onChange={(e)=>{setSearch(e.target.value);fetchData(e.target.value);}} />:  <><h1>Nearest Jobs in next 2 months</h1><Button style={{backgroundColor:grid?'white':'yellow',color:'#0690B1'}} variant="outlined" onClick={(e)=>{e.preventDefault();setGrid(false)}}><MapIcon/>Map</Button>  <Button style={{backgroundColor:grid?'yellow':'white',color:'#0690B1'}} variant="outlined" onClick={(e)=>{e.preventDefault();setGrid(true)}}><GridOnIcon/>Diary</Button>
      </>}
      </div>
      {loc==''?<DataTable columns={columns}
                customStyles={customStyles}
                dense
                progressComponent
               
                pagination
                data={locations}>
                </DataTable>:
                <div>
                
                {grid &&  <DataTable columns={columnsnearest}
                customStyles={customStyles}
                dense
                progressComponent
               
                pagination
                data={data}>
                </DataTable>}


                {!grid && 
     
     <div>
          
     <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API!}>
   <GoogleMap 
     mapContainerStyle={containerStyle}
     center={center}
     zoom={11}>
{locs.map((location, index) => (
       <Marker key={index} title={location.title} position={location} clickable={true} draggable={true}  />
     ))}
   </GoogleMap>
 </LoadScript>
 </div>
}
        </div>}
        </div>
        </div>
    );
};


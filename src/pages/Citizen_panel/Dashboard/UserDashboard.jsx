import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useThemePreference } from "../../../hooks/useThemePreference.js";
import api from "../../../api/axios.js";

import Sidebar from "./Sidebar";
import ComplaintsTable from "./ComplaintsTable";
import NotificationsList from "./NotificationsList";
import SubmitGrievance from "./SubmitGrievance";
import TrackComplaints from "./TrackComplaints";
import FeedbackContainer from "../Feedback/FeedbackContainer";
import Profile from "./Profile";

const WS_URL = import.meta.env.VITE_WS_URL;
const MAX_NOTIFICATIONS = 50;

const UserDashboard = () => {

  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemePreference();

  const [selected, setSelected] = useState("Dashboard");

  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [complaintLoading, setComplaintLoading] = useState(false);
  const [complaintError, setComplaintError] = useState(null);

  const [feedbackComplaint, setFeedbackComplaint] = useState(null);


  const stompClientRef = useRef(null);


  // FIXED TOKEN
  const [token] = useState(
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );


  // AUTH CHECK
  useEffect(() => {

    if (!token) {
      navigate("/", { replace: true });
    }

  }, [token, navigate]);



  // FETCH COMPLAINTS
  const fetchComplaints = useCallback(async () => {

    try {

      setComplaintLoading(true);
      setComplaintError(null);


      const response = await api.get(
        "/api/citizen/complaints?page=0&size=50"
      );


      console.log(
        "API RESPONSE:",
        response.data
      );


      const data = response.data;


      if (data?.content) {

        setComplaints(data.content);

      } else if (Array.isArray(data)) {

        setComplaints(data);

      } else {

        setComplaints([]);

      }


    } catch(error){

      console.log(
        "FETCH ERROR:",
        error?.response?.data
      );


      setComplaintError(
        "Failed to load complaints"
      );


    } finally {

      setComplaintLoading(false);

    }


  }, []);



  // INITIAL LOAD
  useEffect(() => {

    if(token){
      fetchComplaints();
    }

  },[token,fetchComplaints]);



  // DEBUG REMOVE LATER
  console.log(
    "CURRENT COMPLAINTS:",
    complaints
  );



  // NOTIFICATIONS
  const subscribeToNotifications = useCallback(
    (stompClient)=>{


    stompClient.subscribe(
      "/user/queue/notify",
      (message)=>{


        try{


          const payload =
            JSON.parse(message.body);



          setComplaints(prev=>

            prev.map(c=>

              c.id === payload.complaintId

              ? {
                  ...c,
                  status:
                  payload.status ||
                  payload.message
                }

              : c

            )

          );



          setNotifications(prev=>[

            {
              id:Date.now(),

              message:
              `Complaint #${payload.complaintId} updated`,

              timestamp:
              new Date()
              .toLocaleTimeString()

            },

            ...prev

          ].slice(0,MAX_NOTIFICATIONS));



        }catch(e){

          console.log(
            "Notification error",
            e
          );

        }

      }
    );


  },[]);



  // WEBSOCKET
  useEffect(()=>{


    if(!token) return;


    let mounted=true;


    const initWS = async()=>{


      try{


        const {Client}=await import(
          "@stomp/stompjs"
        );


        const {default:SockJS}=await import(
          "sockjs-client"
        );



        const stompClient =
          new Client({

          webSocketFactory:
          ()=>new SockJS(
            WS_URL ||
            `${window.location.origin}/ws`
          ),


          connectHeaders:{
            Authorization:
            `Bearer ${token}`
          },


          reconnectDelay:5000,


          onConnect:()=>{

            if(mounted){

              subscribeToNotifications(
                stompClient
              );

            }

          }


        });



        stompClient.activate();

        stompClientRef.current =
          stompClient;



      }catch(error){

        console.log(
          "Websocket error",
          error
        );

      }


    };


    initWS();



    return ()=>{

      mounted=false;


      if(stompClientRef.current){

        stompClientRef.current.deactivate();

      }

    };


  },[
    token,
    subscribeToNotifications
  ]);



  return (

    <div className="dashboard-shell">


      <Sidebar

        selected={selected}

        setSelected={setSelected}

        notifications={notifications}

        navigate={navigate}

      />



      <div className="dashboard-content">


        <header className="dashboard-header">


          <h1>
            Citizen Dashboard
          </h1>



          <button
            onClick={toggleTheme}
            className="theme-toggle"
          >

            {
              theme==="dark"
              ?
              <Sun size={18}/>
              :
              <Moon size={18}/>
            }

            <span>
              {
              theme==="dark"
              ?"Light"
              :"Dark"
              }
            </span>

          </button>


        </header>




        <div className="dashboard-body">


          {selected==="Dashboard" &&

          <ComplaintsTable

            complaints={complaints}

            loading={complaintLoading}

            error={complaintError}

            fetchComplaints={fetchComplaints}

            onFeedback={(c)=>{

              setFeedbackComplaint(c);

              setSelected("Feedback");

            }}

          />

          }




          {selected==="Submit Grievance" &&

          <SubmitGrievance

            complaints={complaints}

            setComplaints={setComplaints}

          />

          }




          {selected==="Track Complaints" &&

          <TrackComplaints

            initialComplaints={complaints}

            loading={complaintLoading}

            token={token}

          />

          }



          {selected==="Notifications" &&

          <NotificationsList

            notifications={notifications}

            setNotifications={setNotifications}

          />

          }




          {selected==="Feedback" &&

          <FeedbackContainer

            complaints={complaints}

            selectedComplaint={feedbackComplaint}

            clearSelection={
              ()=>setFeedbackComplaint(null)
            }

          />

          }




          {selected==="My Profile" &&

          <Profile navigate={navigate}/>

          }


        </div>


      </div>


    </div>

  );

};


export default UserDashboard;

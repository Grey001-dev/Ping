import axios from 'axios'
const API_URL='http://localhost:5000/api/users'
export async function getUser(){
    const token=localStorage.getItem("token")
    const res=await axios.get(`${API_URL}/me`,{ 
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
    )
    return await res;
}

export async function updateUser(data){
    const token=localStorage.getItem("token")
    const res=await axios.patch(`${API_URL}/notification-email`,
        {notification_email:data.trim()},
        {headers:{Authorization:`Bearer ${token}`}}   
    )
    return await res
}
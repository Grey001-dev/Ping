import axios from 'axios'
const BASE_URL=import.meta.env.VITE_API_BASE_URL || 'https://ping-7u78.onrender.com'
const API_URL=`${BASE_URL}/api/monitors`;
const INCIDENTS_URL=`${BASE_URL}/api/incidents`

export const monitorService={
    async getAll(){
        const token=localStorage.getItem('token')
        const res=await fetch(API_URL,{
            headers:{
                'Content-Type':'application/json',
                "Authorization":`Bearer ${token}`
            }
        });
        return res.json()
    },
    async create(monitorData){
        const token=localStorage.getItem('token')
        const res=await fetch(API_URL,{
            method:"POST",
            headers:{
                'Content-Type':"application/json",
                'Authorization':`Bearer ${token}`
            },
            body:JSON.stringify(monitorData)
        });
        return res.json()

    },
    async delete(id){
        const token=localStorage.getItem("token")
        const res=await fetch(`${API_URL}/${id}`,{
            method:'DELETE',
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${token}`                
            }
        });
        return res.ok
    },
    async pause(id){
        const token=localStorage.getItem("token");
        const res=await fetch(`${API_URL}/${id}/pause`,{
            method:'PATCH',
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${token}`
            }
        })
        return await res.json()

    },
    async edit(monitorData,id){
        const token=localStorage.getItem("token");
        const res=await fetch(`${API_URL}/${id}/update`,{
            method:'PATCH',
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${token}`
            },
            body: JSON.stringify(monitorData)
        });
        return await res.json()
    },
    async incidents(id){
        const token=localStorage.getItem("token")
        const res=await fetch(`${INCIDENTS_URL}/${id}`,{
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${token}`
            }
        });
        const data=await res.json()
        console.log(data)
        return data;
    },
    async fetch24h(id){
        const token=localStorage.getItem('token');
        const res=await fetch(`${API_URL}/${id}/history/24h`,{
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${token}`
            }
        })
        return await res.json();
    }
}
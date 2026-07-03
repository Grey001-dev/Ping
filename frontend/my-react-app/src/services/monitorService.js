const API_URL='http://localhost:5000/api/monitors';

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
                'Authorization':`'Bearer ${token}`
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
    }
}
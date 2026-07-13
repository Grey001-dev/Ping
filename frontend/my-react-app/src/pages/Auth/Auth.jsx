import { useEffect, useState } from 'react';
import styles from './Auth.module.css'
import { useNavigate } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';
import {Check} from 'lucide-react'
export default function Auth({setToken}){
    const [isSignUp,setIsSignUp]=useState(false);
    const [password,setPassword]=useState('');
    const [name,setName]=useState('')
    const [email,setEmail]=useState('')
    const [showPassword,setShowPassword]=useState(false);
    const [errMessage,setErrMessage]=useState('');
    const [successMessage,setSuccessMessage]=useState('');
    const [loading,setLoading]=useState(false)
    const navigate=useNavigate();

    const checkStrength = (str) => {
    if (!str) return 0;
    let points = 0;
    if (str.length >= 6) points++;
    if (/[A-Z]/.test(str)) points++;
    if (/[0-9]/.test(str)) points++;
    if (/[^A-Za-z0-9]/.test(str)) points++;
    return points;
  };
 
  const handleSubmit=async(e)=>{
    e.preventDefault();
    setErrMessage('');
    setSuccessMessage('');
    setLoading(true);
    await new Promise(r=>setTimeout(r,2000))

    const payload={
        isSignUp:isSignUp,
        email:email,
        password:password,
        name:name
    }
    try{
        const response=await fetch('https://ping-7u78.onrender.com/auth/users',{
            method: 'POST',
            headers:{
                'Content-Type':'application/json',
            },
            body:JSON.stringify(payload)
        })
        
        const data=await response.json();
        if(!response.ok){
            throw new Error(data.message || 'Something went wrong.');
        }
        setSuccessMessage(data.message);
        localStorage.setItem('token',data.token);
        localStorage.getItem('token') && setToken(localStorage.getItem('token'))
        //clearing data after successfully logging in
        console.log('User Data:',data.user)
        setTimeout(()=>{
            setSuccessMessage("");
            navigate("/dashboard")
        },2000);
        
        setEmail('');
        setPassword('');
        setName('');

        // setTimeout(()=>{
        //     ///we use this to navigate smoothly to our dashboard
        // },1000)

    }catch(err){
        if(err.message==='Failed to fetch'){
            setErrMessage('Network error-check your connection')
        }
        console.log(err.message)
        setErrMessage(err.message)
        const timer=setTimeout(()=>setErrMessage(""),5000)
    }finally{
        setLoading(false)
    }
  }
  

  const currentScore = checkStrength(password);
    return(
        <div className={styles.screenWrapper}>
            {errMessage && (
                <div className={styles.toast} key={errMessage}>
                    <span className={styles.toastIcon}><TriangleAlert size={14}/></span>
                    <span>{errMessage}</span>
                    <div className={styles.toastProgress}></div>
                </div>
            )}
            {successMessage &&(
                <div className={`${styles.toast} ${styles.toastSuccess}`} key={successMessage}>
                    <span className={styles.toastIcon}><Check size={14}/></span>
                    <span>{successMessage}</span>
                    <div className={styles.toastProgress}></div>
                </div>
            )}
            <div>
                <div className={styles.ping}>Ping</div>
                <div className={styles.btns}>
                    <button className={`${!isSignUp ?styles.activetoggle: styles.togglebtn }`} onClick={()=>setIsSignUp(false)}>Sign in</button>
                    <button className={`${isSignUp ?styles.activetoggle: styles.togglebtn }`}  onClick={()=>setIsSignUp(true)}>Sign up</button>
                </div>
                <div className={styles.message}>
                    <h1 className={styles.authHeading}>{isSignUp? 'Create Account': 'Welcome back'}</h1>
                    <p className={styles.subtext}>Continue with your Github or Google Account</p>
                </div>
                {errMessage && <div className={styles.errAlert}> {errMessage}</div>}
                {successMessage && <div className={styles.successAlert}>{successMessage}</div>}
                <div className={styles.authcontainer}>
                  <button className={styles.oauthBtn }>Continue with GitHub</button>
                  <button className={styles.oauthBtn}>Continue with Google</button>
                </div>
                
                <div className={styles.divider}>
                    <span>or</span>
                </div>
                <form onSubmit={handleSubmit} className={styles.formContainer}>
                    {isSignUp && (<input type='text' 
                    required 
                    placeholder='Username' 
                    onChange={(e)=>setName(e.target.value)}
                    value={name}
                    className={styles.textInput}
                    
                    />)}
                    <input type="text" 
                    required
                    placeholder='Grey@example.gmail.com'
                    onChange={(e)=>setEmail(e.target.value)}
                    value={email}
                    className={styles.textInput}
                    />
                    <div className={styles.passwordWrapper}>
                        <input type={showPassword? 'text':'password'}

                        required
                        placeholder='password' 
                        onChange={(e)=>setPassword(e.target.value)}
                        value={password}
                        className={styles.textInput}
                        />
                        <button type='button'
                        className={styles.eyeToggle}
                        onClick={()=>setShowPassword(!showPassword)}
                        >
                            {showPassword ? 'Hide':'Show'}

                        </button>
                    </div>
                    <button type='submit' className={styles.submitbtn} disabled={loading}>
                        {loading ? (
                            <span className={styles.spinner}></span>
                        ):isSignUp ? 'Create Account' : 'Sign in'}
                    </button>
                </form>
                <p className={styles.switchState}>
                    {isSignUp ? 'Already have an account?' :"Don't have an account?"}
                    <span className={styles.switchLink} onClick={()=>{setIsSignUp(!isSignUp); setPassword('')}}>
                        {isSignUp ? 'Sign in' : 'Sign up'}
                    </span>
                </p>
            </div>

        </div>
    )
}
import { useEffect, useState } from 'react';
import styles from './Auth.module.css'
import { useNavigate } from 'react-router-dom';
export default function Auth(){
    const [isSignUp,setIsSignUp]=useState(false);
    const [password,setPassword]=useState('');
    const [name,setName]=useState('')
    const [email,setEmail]=useState('')
    const [showPassword,setShowPassword]=useState(false);
    const [errMessage,setErrMessage]=useState('');
    const [successMessage,setSuccessMessage]=useState('');
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
  useEffect(()=>{
    let token=localStorage.getItem('token')
    const timer=setTimeout(()=>{
        if(token) navigate('/dashboard')
    },1500)
    return ()=>clearTimeout(timer)
},[navigate]);
  const handleSubmit=async(e)=>{
    e.preventDefault();
    setErrMessage('');
    setSuccessMessage('');

    const payload={
        isSignUp:isSignUp,
        email:email,
        password:password,
        name:name
    }
    try{
        const response=await fetch('http://localhost:5000/auth/users',{
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

        //clearing data after successfully logging in
        console.log('User Data:',data.user)
        setEmail('');
        setPassword('');
        setName('');

        // setTimeout(()=>{
        //     ///we use this to navigate smoothly to our dashboard
        // },1000)

    }catch(err){
        setErrMessage(err.message)
    }
    navigate("/dashboard");
  }
  

  const currentScore = checkStrength(password);
    return(
        <div className={styles.screenWrapper}>
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
                    <button type='submit' className={styles.submitbtn}>
                        {isSignUp ? 'Create Account' : 'Sign in'}
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
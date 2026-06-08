import { useState } from 'react';
import styles from './Auth.module.css'
export default function Auth(){
    const [isSignUp,setIsSignUp]=useState(false);
    const [password,setPassword]=useState('');
    const [Username,setUsername]=useState('')
    const [Email,setEmail]=useState('')
    const [showPassword,setShowPassword]=useState(false);

    const checkStrength = (str) => {
    if (!str) return 0;
    let points = 0;
    if (str.length >= 6) points++;
    if (/[A-Z]/.test(str)) points++;
    if (/[0-9]/.test(str)) points++;
    if (/[^A-Za-z0-9]/.test(str)) points++;
    return points;
  };
  

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
                <div className={styles.authcontainer}>
                  <button className={styles.oauthBtn }>Continue with GitHub</button>
                  <button className={styles.oauthBtn}>Continue with Google</button>
                </div>

                <div className={styles.divider}>
                    <span>or</span>
                </div>
                <form action="" className={styles.formContainer}>
                    {isSignUp && (<input type='text' 
                    required 
                    placeholder='Username' 
                    onChange={(e)=>setUsername(e.target.value)}
                    value={Username}
                    className={styles.textInput}
                    />)}
                    <input type="text" 
                    required
                    placeholder='Grey@example.gmail.com'
                    onChange={(e)=>setEmail(e.target.value)}
                    value={Email}
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
                    <div className={'${styles.strengthSegment} ${currentScore>=3 ? styles.strengthactive}' }>
                        {currentScore}
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
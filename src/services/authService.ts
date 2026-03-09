const API = "http://localhost:5000/api/auth";

/* ================= REGISTER ================= */
export async function registerUser(form:any){
  try{
    const res = await fetch(`${API}/register`,{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify(form)
    });

    const data = await res.json();
    console.log("REGISTER RESPONSE:", data);

    if(!res.ok){
      throw new Error(data.message || "Registration failed");
    }

    // احفظ التوكن
    if(data.token){
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;

  }catch(err:any){
    console.error("REGISTER ERROR:", err.message);
    throw err;
  }
}

/* ================= LOGIN ================= */
export async function loginUser(email:string,password:string){
  try{
    const res = await fetch(`${API}/login`,{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({email,password})
    });

    const data = await res.json();
    console.log("LOGIN RESPONSE:", data);

    if(!res.ok){
      throw new Error(data.message || "Login failed");
    }

    if(data.token){
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;

  }catch(err:any){
    console.error("LOGIN ERROR:", err.message);
    throw err;
  }
}

/* ================= LOGOUT ================= */
export function logoutUser(){
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

/* ================= GET TOKEN ================= */
export function getToken(){
  return localStorage.getItem("token");
}

/* ================= GET USER ================= */
export function getUser(){
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}
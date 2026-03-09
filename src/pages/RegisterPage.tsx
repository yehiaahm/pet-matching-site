import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      console.log("📤 Sending registration data:", form);

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log("🔥 REGISTER RESPONSE:", data);

      // ❌ لو السيرفر رجع error
      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      // ⚠️ تأكد ان فيه token
      if (!data.token) {
        alert("التسجيل تم لكن لم يتم استلام التوكن");
        console.log(data);
        return;
      }

      // 💾 حفظ البيانات
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("✅ Saved token & user");

      alert("تم إنشاء الحساب بنجاح 🔥");

      // 🚀 تحويل للدashboard
      navigate("/dashboard");

    } catch (err: any) {
      console.error("❌ REGISTER ERROR:", err);
      alert("Server error");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input name="firstName" placeholder="First name" onChange={handleChange} /><br/><br/>
        <input name="lastName" placeholder="Last name" onChange={handleChange} /><br/><br/>
        <input name="email" placeholder="Email" onChange={handleChange} /><br/><br/>
        <input name="phone" placeholder="Phone" onChange={handleChange} /><br/><br/>
        <input name="password" type="password" placeholder="Password" onChange={handleChange} /><br/><br/>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}
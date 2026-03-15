import { Link,useNavigate } from "react-router-dom"

export default function Login(){

const navigate=useNavigate()

const handleSubmit=(e)=>{
  e.preventDefault()
  navigate("/dashboard")
}

return(

<div className="h-screen flex items-center justify-center bg-sand">

<div className="bg-white p-10 rounded-xl shadow w-96">

<h2 className="text-3xl font-bold text-primary mb-6 text-center">
Admin Login
</h2>

<form onSubmit={handleSubmit} className="flex flex-col gap-4">

<input
type="email"
placeholder="Email"
className="border p-3 rounded"
/>

<input
type="password"
placeholder="Password"
className="border p-3 rounded"
/>

<button className="bg-primary text-white p-3 rounded">
Login
</button>

</form>

<Link
to="/reset-password"
className="text-sm text-primary mt-4 block text-center"
>
Forgot Password?
</Link>

</div>

</div>

)

}
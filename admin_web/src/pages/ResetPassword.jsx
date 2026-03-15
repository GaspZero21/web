export default function ResetPassword(){

return(

<div className="h-screen flex items-center justify-center bg-sand">

<div className="bg-white p-10 rounded shadow w-96">

<h2 className="text-2xl font-bold mb-6 text-center">
Reset Password
</h2>

<input
type="email"
placeholder="Enter your email"
className="border p-3 w-full rounded mb-4"
/>

<button className="bg-primary text-white w-full p-3 rounded">
Send Reset Link
</button>

</div>

</div>

)

}
export default function Avatar(){

  return(

    <div className="flex items-center gap-3">

      <div className="text-right">

        <p className="font-semibold">
          Admin
        </p>

        <p className="text-xs text-gray-500">
          admin@email.com
        </p>

      </div>

      <img
        src="https://i.pravatar.cc/40"
        className="w-10 h-10 rounded-full"
      />

    </div>

  )

}
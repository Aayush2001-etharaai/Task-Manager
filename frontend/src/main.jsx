return (
  <div className="min-h-screen w-full flex items-center justify-center bg-cover bg-center px-4 py-10"
    style={{
      backgroundImage:
        "url('https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=2070&auto=format&fit=crop')",
    }}
  >
    <div className="w-full max-w-md bg-[#14213d]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

      <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

      <div className="p-8">

        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-4xl">
            👥
          </div>
        </div>

        <h1 className="text-5xl font-bold text-center text-white">
          Project Flow
        </h1>

        <p className="text-center text-gray-300 mt-3 mb-8 text-lg">
          Manage your projects efficiently
        </p>

        <form className="space-y-5">

          <div>
            <label className="block text-white mb-2 font-medium">
              Email Address
            </label>

            <input
              type="email"
              placeholder="admin@example.com"
              className="w-full px-4 py-3 rounded-2xl bg-white text-black outline-none"
            />
          </div>

          <div>
            <label className="block text-white mb-2 font-medium">
              Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-2xl bg-white text-black outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all duration-300"
          >
            LOGIN
          </button>
        </form>

        <p className="text-center text-gray-300 mt-6">
          Don’t have an account?
          <span className="text-blue-400 ml-1 cursor-pointer">
            Sign up
          </span>
        </p>

      </div>
    </div>
  </div>
)
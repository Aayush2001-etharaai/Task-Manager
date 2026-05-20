import React, { useState } from "react"
import { MdClose, MdMenu } from "react-icons/md"
import SideMenu from "./SideMenu"

const Navbar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false)

  return (
    <div className="bg-slate-800 shadow-md border-b border-slate-700 sticky top-0 z-30 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none transition-colors lg:hidden"
          onClick={() => setOpenSideMenu(!openSideMenu)}
        >
          {openSideMenu ? (
            <MdClose className="text-2xl" />
          ) : (
            <MdMenu className="text-2xl" />
          )}
        </button>
      </div>

      <h2 className="text-xl font-semibold text-white">Project Flow</h2>

      {openSideMenu && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="relative z-50 w-72 h-full bg-slate-800 shadow-xl border-r border-slate-700">
            <button
              className="absolute top-4 right-4 p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none transition-colors"
              onClick={() => setOpenSideMenu(false)}
            >
              <MdClose className="text-2xl" />
            </button>

            <div className="pt-16 h-full">
              <SideMenu activeMenu={activeMenu} />
            </div>
          </div>
          {/* Backdrop for mobile menu */}
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setOpenSideMenu(false)}></div>
        </div>
      )}
    </div>
  )
}

export default Navbar

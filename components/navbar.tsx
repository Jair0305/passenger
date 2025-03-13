"use client"

import type React from "react"

import Image from "next/image"
import { useEffect, useState } from "react"
import Link from "next/link"

export function Navbar() {
  // Add state for mobile menu and dropdown
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [homeDropdownOpen, setHomeDropdownOpen] = useState(false)

  // Toggle functions
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
    // Close dropdown when closing menu
    if (mobileMenuOpen) setHomeDropdownOpen(false)
  }

  const toggleHomeDropdown = (e: React.MouseEvent) => {
    e.preventDefault()
    setHomeDropdownOpen(!homeDropdownOpen)
  }

  useEffect(() => {
    // Mobile menu functionality
    const mobileMenuButton = document.querySelector(".mobile-menu-button")
    const menuList = document.querySelector(".custom-menu-list")
    const dropdowns = document.querySelectorAll(".dropdown")

    if (mobileMenuButton && menuList) {
      mobileMenuButton.addEventListener("click", function (this: HTMLButtonElement) {
        this.classList.toggle("mobile-menu-open")
        menuList.classList.toggle("active")
      })
    }

    // Handle dropdown toggles on mobile
    dropdowns.forEach((dropdown) => {
      const toggle = dropdown.querySelector(".dropdown-toggle")
      if (toggle) {
        toggle.addEventListener("click", (e) => {
          if (window.innerWidth <= 768) {
            e.preventDefault()
            dropdown.classList.toggle("active")
          }
        })
      }
    })

    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement
      if (
        window.innerWidth <= 768 &&
        !target.closest(".custom-menu-container") &&
        menuList?.classList.contains("active")
      ) {
        menuList.classList.remove("active")
        mobileMenuButton?.classList.remove("mobile-menu-open")
      }
    })

    // Handle window resize
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        menuList?.classList.remove("active")
        mobileMenuButton?.classList.remove("mobile-menu-open")
        dropdowns.forEach((dropdown) => dropdown.classList.remove("active"))
      }
    })
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full bg-[#14181B]">
      <div className="container mx-auto px-4 py-8 md:p-8 w-full">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/white-logo.svg"
              alt="Executive Engineers Logo"
              width={200}
              height={33}
              priority
              className="h-auto"
            />
          </Link>

          {/* Desktop menu - FIXED: now part of the same flex container as the logo */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-2">
              {/* About Us Dropdown */}
              <li className="relative group">
                <a
                  href="#"
                  className="flex items-center gap-1 px-4 py-2 text-white hover:text-[#00a8e1] hover:bg-white/5 rounded-md text-sm font-medium transition-all duration-200"
                >
                  Home
                  <svg
                    className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </a>
                <ul className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 min-w-[180px] bg-[#14181B] rounded-lg p-2 shadow-lg">
                  <li>
                    <Link
                      href="https://executive-engineers.com/"
                      className="block px-4 py-2 text-sm text-white hover:text-[#00a8e1] hover:bg-white/5 rounded-md"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://executive-engineers.com/core-values"
                      className="block px-4 py-2 text-sm text-white hover:text-[#00a8e1] hover:bg-white/5 rounded-md"
                    >
                      Core Values
                    </Link>
                  </li>
                  <li>
                    <a
                      target="_blank"
                      href="https://www.linkedin.com/company/executive-engineers"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:text-[#00a8e1] hover:bg-white/5 rounded-md"
                      rel="noreferrer"
                    >
                      <svg
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                      </svg>
                      <span>LinkedIn</span>
                    </a>
                  </li>
                </ul>
              </li>

              {/* Expertise Link */}
              <li>
                <Link
                  href="https://executive-engineers.com/expertise"
                  className="block px-4 py-2 text-sm font-medium text-white hover:text-[#00a8e1] hover:bg-white/5 rounded-md transition-all duration-200"
                >
                  Expertise
                </Link>
              </li>

              {/* Management Link */}
              <li>
                <Link
                  href="https://executive-engineers.com/management"
                  className="block px-4 py-2 text-sm font-medium text-white hover:text-[#00a8e1] hover:bg-white/5 rounded-md transition-all duration-200"
                >
                  Management
                </Link>
              </li>

              {/* Contact Link */}
              <li>
                <Link
                  href="https://executive-engineers.com/contact"
                  className="block px-4 py-2 text-sm font-medium text-white hover:text-[#00a8e1] hover:bg-white/5 rounded-md transition-all duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Button with animated icon and blue square background */}
          <button
            className="block md:hidden text-white hover:text-[#00a8e1] focus:outline-none z-50 bg-[#00a8e1] p-0 rounded-[4px] flex items-center justify-center"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            style={{ width: "40px", height: "40px" }}
          >
            <div className="w-6 h-5 relative flex justify-center items-center">
              <span
                className={`absolute h-0.5 w-6 bg-white transform transition-all duration-300 ease-in-out ${
                  mobileMenuOpen ? "rotate-45" : "-translate-y-1.5"
                }`}
              ></span>
              <span
                className={`absolute h-0.5 bg-white transform transition-all duration-300 ease-in-out ${
                  mobileMenuOpen ? "w-0" : "w-6"
                }`}
              ></span>
              <span
                className={`absolute h-0.5 w-6 bg-white transform transition-all duration-300 ease-in-out ${
                  mobileMenuOpen ? "-rotate-45" : "translate-y-1.5"
                }`}
              ></span>
            </div>
          </button>
        </div>

        {/* Full-width mobile menu that pushes content down */}
        <div
          className={`w-full md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            mobileMenuOpen ? "max-h-screen mt-4 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="py-4">
            <ul className="flex flex-col space-y-6 text-center">
              {/* Home with dropdown */}
              <li className="group">
                <a
                  href="#"
                  className="text-white text-xl hover:text-[#00a8e1] flex items-center justify-center"
                  onClick={toggleHomeDropdown}
                >
                  Home
                  <svg
                    className={`ml-2 w-4 h-4 transition-transform duration-200 ${homeDropdownOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </a>

                {/* Home dropdown items */}
                <div
                  className={`space-y-3 overflow-hidden transition-all duration-300 ${
                    homeDropdownOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <a
                    href="https://www.executive-engineers.com/"
                    className="block text-white text-lg hover:text-[#00a8e1] mt-4"
                  >
                    About Us
                  </a>
                  <a
                    href="https://www.executive-engineers.com/core-values"
                    className="block text-white text-lg hover:text-[#00a8e1]"
                  >
                    Core Values
                  </a>
                  <a
                    href="https://www.linkedin.com/company/executive-engineers"
                    className="flex items-center justify-center text-white text-lg hover:text-[#00a8e1]"
                  >
                    <svg
                      className="mr-2 w-4 h-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                    </svg>
                    LinkedIn
                  </a>
                </div>
              </li>

              <li>
                <a
                  href="https://www.executive-engineers.com/expertise"
                  className="text-white text-xl hover:text-[#00a8e1]"
                >
                  Expertise
                </a>
              </li>
              <li>
                <a
                  href="https://www.executive-engineers.com/management"
                  className="text-white text-xl hover:text-[#00a8e1]"
                >
                  Management
                </a>
              </li>
              <li>
                <a
                  href="https://www.executive-engineers.com/contact"
                  className="text-white text-xl hover:text-[#00a8e1]"
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}


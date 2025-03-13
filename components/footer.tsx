import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full bg-[#14181B] text-white/60 text-sm p-8">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex gap-6">
          <Link href="https://executive-engineers.com/legal" className="hover:text-[#00a8e1] text-sm transition-colors">
            Legal
          </Link>
          <Link
            href="https://executive-engineers.com/privacy"
            className="hover:text-[#00a8e1] text-sm transition-colors"
          >
            Privacy
          </Link>
        </div>
        <div>© 2025 Executive Engineers</div>
      </div>
    </footer>
  )
}


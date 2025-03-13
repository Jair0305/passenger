"use client"

import { QrCode, MapPin, Calendar, Clock, Ticket } from "lucide-react"
import { Card } from "@/components/ui/card"

interface PassData {
  title: string
  subtitle: string
  description: string
  logoText: string
  organizationName?: string
  
  // Colores
  primaryColor: string
  secondaryColor: string
  backgroundColor?: string
  foregroundColor?: string
  labelColor?: string
  logoTextColor?: string
  
  // Ubicación y fechas
  location: string
  date: string
  time: string
  
  // Opciones de configuración
  barcode: boolean
  barcodeFormat?: string
  notifications: boolean
  
  // Imágenes
  logoImage?: string
  iconImage?: string
  stripImage?: string
  footerImage?: string
  backgroundImage?: string
  thumbnailImage?: string
  
  // Opciones de relevancia
  relevantDate?: string
  expirationDate?: string
  voided?: boolean
  
  // Alineación
  headerAlignment?: string
  primaryAlignment?: string
  secondaryAlignment?: string
  auxiliaryAlignment?: string
  
  // Estilo de fecha
  dateStyle?: string
  timeStyle?: string
  
  // Reverso
  showReverse?: boolean
}

interface PassPreviewProps {
  passType: "event" | "loyalty" | "coupon" | "boarding" | "generic" | "storeCard"
  passData: PassData
}

export function PassPreview({ passType, passData }: PassPreviewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative w-[320px] h-[500px] perspective-[1000px] transform-style-preserve-3d">
        <Card
          className="absolute w-full h-full rounded-xl overflow-hidden shadow-xl transform transition-transform duration-500 hover:rotate-y-10 hover:shadow-2xl"
          style={{ backgroundColor: passData.secondaryColor }}
        >
          {/* Header */}
          <div
            className="h-24 flex items-center justify-between px-6"
            style={{ backgroundColor: passData.primaryColor }}
          >
            <div className="flex flex-col text-white">
              <h3 className="font-bold text-lg">{passData.title}</h3>
              <p className="text-sm opacity-90">{passData.subtitle}</p>
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: passData.secondaryColor }}
            >
              {passData.logoText}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 text-white">
            <p className="text-sm mb-6">{passData.description}</p>

            <div className="space-y-4">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-3" style={{ color: passData.primaryColor }} />
                <span>{passData.location}</span>
              </div>

              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-3" style={{ color: passData.primaryColor }} />
                <span>{formatDate(passData.date)}</span>
              </div>

              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-3" style={{ color: passData.primaryColor }} />
                <span>
                  {new Date(`2000-01-01T${passData.time}`).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>

              {passType === "event" && (
                <div className="flex items-center">
                  <Ticket className="w-5 h-5 mr-3" style={{ color: passData.primaryColor }} />
                  <span>General Admission</span>
                </div>
              )}
            </div>

            {/* Barcode/QR Code */}
            {passData.barcode && (
              <div className="mt-8 flex flex-col items-center">
                <div className="bg-white p-2 rounded-lg">
                  <QrCode className="w-32 h-32 text-black" />
                </div>
                <p className="text-xs mt-2 text-center opacity-70">Scan to validate</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="flex space-x-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-gray-300">
          <img src="/placeholder.svg?height=40&width=40" alt="Apple Wallet" className="w-6 h-6" />
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-gray-300">
          <img src="/placeholder.svg?height=40&width=40" alt="Google Pay" className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}


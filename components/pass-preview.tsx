"use client"

import { useState, useEffect } from "react"
import { QrCode, MapPin, Calendar, Clock, Ticket, Tag, CreditCard, Percent } from "lucide-react"
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
  location?: string
  date?: string
  time?: string
  
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

  // Campos específicos por tipo de pase
  balance?: string
  membershipNumber?: string
  discount?: string
  boardingTime?: string
  gate?: string
  seat?: string
  flightNumber?: string
}

interface PassPreviewProps {
  passType: "event" | "loyalty" | "coupon" | "boarding" | "generic" | "storeCard"
  passData: PassData
}

export function PassPreview({ passType, passData }: PassPreviewProps) {
  const [isReversed, setIsReversed] = useState(false);
  const [imagePreview, setImagePreview] = useState({
    logo: '',
    icon: '',
    strip: '',
    background: '',
    thumbnail: '',
    footer: ''
  });

  // Actualizar vistas previas de imágenes cuando cambian los datos del pase
  useEffect(() => {
    if (passData.logoImage && typeof passData.logoImage === 'string' && passData.logoImage.startsWith('data:')) {
      setImagePreview(prev => ({ ...prev, logo: passData.logoImage || '' }));
    }
    
    if (passData.iconImage && typeof passData.iconImage === 'string' && passData.iconImage.startsWith('data:')) {
      setImagePreview(prev => ({ ...prev, icon: passData.iconImage || '' }));
    }
    
    if (passData.stripImage && typeof passData.stripImage === 'string' && passData.stripImage.startsWith('data:')) {
      setImagePreview(prev => ({ ...prev, strip: passData.stripImage || '' }));
    }
    
    if (passData.backgroundImage && typeof passData.backgroundImage === 'string' && passData.backgroundImage.startsWith('data:')) {
      setImagePreview(prev => ({ ...prev, background: passData.backgroundImage || '' }));
    }
    
    if (passData.thumbnailImage && typeof passData.thumbnailImage === 'string' && passData.thumbnailImage.startsWith('data:')) {
      setImagePreview(prev => ({ ...prev, thumbnail: passData.thumbnailImage || '' }));
    }
    
    if (passData.footerImage && typeof passData.footerImage === 'string' && passData.footerImage.startsWith('data:')) {
      setImagePreview(prev => ({ ...prev, footer: passData.footerImage || '' }));
    }
  }, [passData.logoImage, passData.iconImage, passData.stripImage, passData.backgroundImage, passData.thumbnailImage, passData.footerImage]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Si la fecha no es válida, devuelve el string original
      
      let options: Intl.DateTimeFormatOptions = { 
        weekday: undefined,
        month: undefined, 
        day: undefined, 
        year: undefined 
      };
      
      switch (passData.dateStyle) {
        case 'short':
          options = { year: 'numeric', month: 'numeric', day: 'numeric' };
          break;
        case 'medium':
          options = { year: 'numeric', month: 'short', day: 'numeric' };
          break;
        case 'long':
          options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
          break;
        case 'full':
          options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
          break;
        default:
          options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
      }
      
      return date.toLocaleDateString("es-ES", options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return "";
    
    try {
      const date = new Date(`2000-01-01T${timeString}`);
      if (isNaN(date.getTime())) return timeString; // Si la hora no es válida, devuelve el string original
      
      let options: Intl.DateTimeFormatOptions = { 
        hour: undefined, 
        minute: undefined, 
        second: undefined,
        hour12: undefined,
        timeZoneName: undefined
      };
      
      switch (passData.timeStyle) {
        case 'short':
          options = { hour: 'numeric', minute: '2-digit', hour12: true };
          break;
        case 'medium':
          options = { hour: 'numeric', minute: '2-digit', hour12: true };
          break;
        case 'long':
          options = { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true, timeZoneName: 'short' };
          break;
        default:
          options = { hour: 'numeric', minute: '2-digit', hour12: true };
      }
      
      return date.toLocaleTimeString("es-ES", options);
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString;
    }
  }
  
  // Función para obtener la alineación de texto en CSS
  const getTextAlignment = (alignment?: string): string => {
    switch (alignment) {
      case 'left': return 'text-left';
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return '';
    }
  }

  // Determinar colores que se usarán en el pase
  const foregroundColor = passData.foregroundColor || '#FFFFFF';
  const backgroundColor = passData.backgroundColor || '#1E293B';
  const primaryColor = passData.primaryColor || '#3B82F6';
  const secondaryColor = passData.secondaryColor || '#1E293B';
  const labelColor = passData.labelColor || '#94A3B8';

  // Generar estilo de la tarjeta con imágenes si existen
  const cardStyle: React.CSSProperties = {
    backgroundColor: secondaryColor,
    backgroundImage: imagePreview.background ? `url(${imagePreview.background})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: foregroundColor
  };

  // Devuelve los campos específicos según el tipo de pase
  const renderPassTypeFields = () => {
    switch(passType) {
      case "event":
        return (
          <div className="space-y-4">
            {passData.location && (
              <div className={`flex items-center ${getTextAlignment(passData.secondaryAlignment)}`}>
                <MapPin className="w-5 h-5 mr-3" style={{ color: primaryColor }} />
                <span>{passData.location}</span>
              </div>
            )}
            
            {passData.date && (
              <div className={`flex items-center ${getTextAlignment(passData.auxiliaryAlignment)}`}>
                <Calendar className="w-5 h-5 mr-3" style={{ color: primaryColor }} />
                <span>{formatDate(passData.date)}</span>
              </div>
            )}
            
            {passData.time && (
              <div className={`flex items-center ${getTextAlignment(passData.auxiliaryAlignment)}`}>
                <Clock className="w-5 h-5 mr-3" style={{ color: primaryColor }} />
                <span>{formatTime(passData.time)}</span>
              </div>
            )}

            <div className={`flex items-center ${getTextAlignment(passData.auxiliaryAlignment)}`}>
              <Ticket className="w-5 h-5 mr-3" style={{ color: primaryColor }} />
              <span>Entrada General</span>
            </div>
          </div>
        );
        
      case "loyalty":
        return (
          <div className="space-y-4">
            <div className={`flex items-center ${getTextAlignment(passData.secondaryAlignment)}`}>
              <Tag className="w-5 h-5 mr-3" style={{ color: primaryColor }} />
              <span>Nº Socio: {passData.membershipNumber || "1234567890"}</span>
            </div>
            
            <div className={`flex items-center ${getTextAlignment(passData.auxiliaryAlignment)}`}>
              <CreditCard className="w-5 h-5 mr-3" style={{ color: primaryColor }} />
              <span>Saldo: {passData.balance || "150 puntos"}</span>
            </div>
            
            {passData.expirationDate && (
              <div className={`flex items-center ${getTextAlignment(passData.auxiliaryAlignment)}`}>
                <Calendar className="w-5 h-5 mr-3" style={{ color: primaryColor }} />
                <span>Válido hasta: {formatDate(passData.expirationDate)}</span>
              </div>
            )}
          </div>
        );
        
      case "coupon":
        return (
          <div className="space-y-4">
            <div className={`flex items-center justify-center text-3xl font-bold my-4 ${getTextAlignment(passData.primaryAlignment)}`}>
              <Percent className="w-7 h-7 mr-3" style={{ color: primaryColor }} />
              <span>{passData.discount || "20% DESCUENTO"}</span>
            </div>
            
            {passData.expirationDate && (
              <div className={`flex items-center ${getTextAlignment(passData.auxiliaryAlignment)}`}>
                <Calendar className="w-5 h-5 mr-3" style={{ color: primaryColor }} />
                <span>Válido hasta: {formatDate(passData.expirationDate)}</span>
              </div>
            )}
            
            {passData.location && (
              <div className={`flex items-center ${getTextAlignment(passData.secondaryAlignment)}`}>
                <MapPin className="w-5 h-5 mr-3" style={{ color: primaryColor }} />
                <span>{passData.location}</span>
              </div>
            )}
          </div>
        );
        
      case "boarding":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <p className="text-sm" style={{ color: labelColor }}>VUELO</p>
                <p className="font-bold text-lg">{passData.flightNumber || "AB123"}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: labelColor }}>PUERTA</p>
                <p className="font-bold text-lg">{passData.gate || "B12"}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <p className="text-sm" style={{ color: labelColor }}>ASIENTO</p>
                <p className="font-bold text-lg">{passData.seat || "23A"}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: labelColor }}>EMBARQUE</p>
                <p className="font-bold text-lg">{passData.boardingTime || "11:30"}</p>
              </div>
            </div>
            
            {passData.date && (
              <div className={`flex items-center ${getTextAlignment(passData.auxiliaryAlignment)}`}>
                <Calendar className="w-5 h-5 mr-3" style={{ color: primaryColor }} />
                <span>{formatDate(passData.date)}</span>
              </div>
            )}
          </div>
        );
        
      case "storeCard":
        return (
          <div className="space-y-4">
            <div className={`flex items-center ${getTextAlignment(passData.secondaryAlignment)}`}>
              <Tag className="w-5 h-5 mr-3" style={{ color: primaryColor }} />
              <span>Nº Tarjeta: {passData.membershipNumber || "1234-5678-9012"}</span>
            </div>
            
            <div className={`flex items-center ${getTextAlignment(passData.auxiliaryAlignment)}`}>
              <CreditCard className="w-5 h-5 mr-3" style={{ color: primaryColor }} />
              <span>Saldo: {passData.balance || "50,00 €"}</span>
            </div>
            
            {passData.location && (
              <div className={`flex items-center ${getTextAlignment(passData.secondaryAlignment)}`}>
                <MapPin className="w-5 h-5 mr-3" style={{ color: primaryColor }} />
                <span>{passData.location}</span>
              </div>
            )}
          </div>
        );
        
      case "generic":
      default:
        return (
          <div className="space-y-4">
            {passData.location && (
              <div className={`flex items-center ${getTextAlignment(passData.secondaryAlignment)}`}>
                <MapPin className="w-5 h-5 mr-3" style={{ color: primaryColor }} />
                <span>{passData.location}</span>
              </div>
            )}
            
            {passData.date && (
              <div className={`flex items-center ${getTextAlignment(passData.auxiliaryAlignment)}`}>
                <Calendar className="w-5 h-5 mr-3" style={{ color: primaryColor }} />
                <span>{formatDate(passData.date)}</span>
              </div>
            )}
            
            {passData.time && (
              <div className={`flex items-center ${getTextAlignment(passData.auxiliaryAlignment)}`}>
                <Clock className="w-5 h-5 mr-3" style={{ color: primaryColor }} />
                <span>{formatTime(passData.time)}</span>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative w-[320px] h-[500px] perspective-[1000px] transform-style-preserve-3d">
        <Card
          className="absolute w-full h-full rounded-xl overflow-hidden shadow-xl transform transition-transform duration-500 cursor-pointer"
          style={{
            ...cardStyle,
            transform: isReversed ? 'rotateY(180deg)' : 'rotateY(0)',
          }}
          onClick={() => passData.showReverse && setIsReversed(!isReversed)}
        >
          {!isReversed ? (
            <>
              {/* Imagen Strip en la parte superior si existe */}
              {imagePreview.strip && (
                <div className="w-full h-32 bg-cover bg-center" style={{ backgroundImage: `url(${imagePreview.strip})` }} />
              )}
              
          {/* Header */}
          <div
            className="h-24 flex items-center justify-between px-6"
                style={{ 
                  backgroundColor: primaryColor,
                  backgroundImage: !imagePreview.strip ? undefined : 'none'
                }}
              >
                <div className={`flex flex-col text-white ${getTextAlignment(passData.headerAlignment)}`}>
                  <h3 className="font-bold text-lg">{passData.title || "Título del Pase"}</h3>
                  <p className="text-sm opacity-90">{passData.subtitle || "Subtítulo"}</p>
                </div>
                
                {imagePreview.logo ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img 
                      src={imagePreview.logo} 
                      alt="Logo" 
                      className="w-full h-full object-cover" 
                    />
            </div>
                ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ 
                      backgroundColor: secondaryColor,
                      color: passData.logoTextColor || '#FFFFFF'
                    }}
            >
                    {passData.logoText || "LG"}
            </div>
                )}
          </div>

          {/* Content */}
          <div className="p-6 text-white">
                {imagePreview.thumbnail && (
                  <div className="mb-4 w-full flex justify-center">
                    <div className="w-32 h-32 rounded-lg overflow-hidden">
                      <img 
                        src={imagePreview.thumbnail} 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover" 
                      />
              </div>
                </div>
              )}
              
                <p className={`text-sm mb-6 ${getTextAlignment(passData.primaryAlignment)}`}>{passData.description}</p>

                {/* Campos específicos según el tipo de pase */}
                {renderPassTypeFields()}

            {/* Barcode/QR Code */}
            {passData.barcode && (
              <div className="mt-8 flex flex-col items-center">
                <div className="bg-white p-2 rounded-lg">
                  <QrCode className="w-32 h-32 text-black" />
                </div>
                <p className="text-xs mt-2 text-center opacity-70">Scan to validate</p>
              </div>
            )}
                
                {/* Footer image if exists */}
                {imagePreview.footer && (
                  <div className="mt-4 flex justify-center">
                    <img 
                      src={imagePreview.footer} 
                      alt="Footer" 
                      className="max-h-16 object-contain" 
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            // Reverse side of the pass
            <div className="p-6 h-full" style={{ 
                backgroundColor: backgroundColor, 
                color: foregroundColor,
                transform: 'rotateY(180deg)', /* Voltear el contenido para legibilidad */
              }}>
              <h3 className="text-xl font-bold mb-4 text-center">Información Adicional</h3>
              
              <div className="space-y-4">
                {passData.organizationName && (
                  <div className="mb-3">
                    <p className="text-sm" style={{ color: labelColor }}>ORGANIZACIÓN</p>
                    <p>{passData.organizationName}</p>
                  </div>
                )}
                
                <div className="mb-3">
                  <p className="text-sm" style={{ color: labelColor }}>DESCRIPCIÓN</p>
                  <p>{passData.description}</p>
                </div>
                
                {passData.relevantDate && (
                  <div className="mb-3">
                    <p className="text-sm" style={{ color: labelColor }}>FECHA RELEVANTE</p>
                    <p>{new Date(passData.relevantDate).toLocaleString()}</p>
                  </div>
                )}
                
                {passData.expirationDate && (
                  <div className="mb-3">
                    <p className="text-sm" style={{ color: labelColor }}>FECHA DE EXPIRACIÓN</p>
                    <p>{new Date(passData.expirationDate).toLocaleString()}</p>
                  </div>
                )}
                
                {passData.voided && (
                  <div className="p-2 bg-red-500/20 text-red-500 font-semibold text-center rounded-md">
                    PASS ANULADO
                  </div>
                )}
              </div>
          </div>
          )}
        </Card>
      </div>

      {passData.showReverse && (
        <div className="text-sm text-center text-gray-500 mt-2">
          Haz clic en la tarjeta para ver el {isReversed ? "frente" : "reverso"}
        </div>
      )}

      <div className="flex space-x-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-gray-300">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 10C20 14.4183 16.4183 18 12 18C7.58172 18 4 14.4183 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10Z" fill="#000000" />
            <path d="M16 21H8C6.89543 21 6 20.1046 6 19V10C6 8.89543 6.89543 8 8 8H16C17.1046 8 18 8.89543 18 10V19C18 20.1046 17.1046 21 16 21Z" fill="#CCCCCC" />
            <path d="M20 10C20 14.4183 16.4183 18 12 18C7.58172 18 4 14.4183 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10Z" stroke="black" strokeWidth="1.5" />
            <path d="M16 21H8C6.89543 21 6 20.1046 6 19V10C6 8.89543 6.89543 8 8 8H16C17.1046 8 18 8.89543 18 10V19C18 20.1046 17.1046 21 16 21Z" stroke="black" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  )
}


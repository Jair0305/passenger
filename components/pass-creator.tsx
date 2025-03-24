"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ColorPicker } from "@/components/color-picker"
import { PassPreview } from "@/components/pass-preview"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Upload, Plus, Trash2, Download } from "lucide-react"
import { AdvancedPassEditor, PositionableElement } from "@/components/advanced-pass-editor"

// Define un tipo para los campos personalizados
interface CustomField {
  id: string;
  key: string;
  label: string;
  value: string;
  textAlignment: "left" | "center" | "right" | "natural";
}

// Definir el tipo de pase
type PassType = "event" | "loyalty" | "coupon" | "boarding" | "generic" | "storeCard" | "contact";

interface PassData {
  title: string;
  subtitle: string;
  description: string;
  logoText: string;
  organizationName: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  foregroundColor: string;
  labelColor?: string;
  logoTextColor?: string;
  date: string;
  time: string;
  location: string;
  barcode: {
    message: string;
    format: string;
    messageEncoding: string;
  };
  headerAlignment: string;
  primaryAlignment: string;
  secondaryAlignment: string;
  auxiliaryAlignment: string;
  allowFullCustomization: boolean;
  customization: {
    enable: boolean;
    width: string;
    height: string;
  };
  relevantDate: string;
  expirationDate: string;
  notifications: boolean;
  
  // Configuración de fechas
  dateStyle?: string;
  timeStyle?: string;
  voided?: boolean;
  
  // Opciones avanzadas
  showReverse?: boolean;
  useAdvancedEditor?: boolean;
  customWidth?: number;
  customHeight?: number;
  allowCustomDimensions?: boolean;
  customPassType?: boolean;

  // Campos específicos para tipos de pases
  // Campos para Loyalty Card
  membershipNumber?: string;
  balance?: string;
  
  // Campos para Cupones
  discount?: string;
  
  // Campos para Boarding Pass
  flightNumber?: string;
  gate?: string;
  seat?: string;
  boardingTime?: string;
  
  // Imágenes (se almacenan como base64 en el frontend)
  logoImage?: string;
  iconImage?: string;
  stripImage?: string;
  backgroundImage?: string;
  thumbnailImage?: string;
  footerImage?: string;
  
  // Campos personalizados
  backFields?: Array<{
    key: string;
    label: string;
    value: string;
    textAlignment?: string;
  }>;

  // Campos para Contact Pass
  contactName?: string;
  contactPhone?: string; 
  contactEmail?: string;
  contactAddress?: string;
  contactWebsite?: string;
  contactJob?: string;
  contactCompany?: string;
}

export function PassCreator() {
  const [passType, setPassType] = useState<PassType>("event")
  const [passData, setPassData] = useState<PassData>({
    title: "Executive Engineers Conference",
    subtitle: "Annual Tech Summit",
    description: "Join us for the tech industry's premier conference",
    logoText: "EEC",
    organizationName: "Tech Events Inc.",
    
    // Colores del pase
    primaryColor: "#3f51b5",
    secondaryColor: "#2196f3",
    backgroundColor: "#e8eaf6",
    foregroundColor: "#173f5f",
    
    // Información de evento
    date: "2023-12-15",
    time: "10:00",
    location: "Tech Convention Center",
    
    // Código de barras
    barcode: {
      message: "Executive Engineers Conference",
      format: "QR",
      messageEncoding: "iso-8859-1"
    },
    notifications: true,
    
    // Alineación del texto
    headerAlignment: "PKTextAlignmentCenter",
    primaryAlignment: "PKTextAlignmentCenter",
    secondaryAlignment: "PKTextAlignmentCenter",
    auxiliaryAlignment: "PKTextAlignmentCenter",
    
    // Personalización avanzada
    allowFullCustomization: false,
    customization: {
      enable: false,
      width: "100%",
      height: "auto"
    },
    
    // Fechas importantes
    relevantDate: "",
    expirationDate: "",
    
    // Campos específicos por tipo de pase
    membershipNumber: "",
    balance: "",
    discount: "",
    flightNumber: "",
    gate: "",
    seat: "",
    boardingTime: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    contactAddress: "",
    contactWebsite: "",
    contactJob: "",
    contactCompany: ""
  })
  
  // Estados para campos personalizados por sección
  const [headerFields, setHeaderFields] = useState<CustomField[]>([])
  const [primaryFields, setPrimaryFields] = useState<CustomField[]>([])
  const [secondaryFields, setSecondaryFields] = useState<CustomField[]>([])
  const [auxiliaryFields, setAuxiliaryFields] = useState<CustomField[]>([])
  const [backFields, setBackFields] = useState<CustomField[]>([])

  // Estado para editor avanzado
  const [freeElements, setFreeElements] = useState<PositionableElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Estado para el estado de la generación del pase
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [certificateStatus, setCertificateStatus] = useState<{ valid: boolean; message: string } | null>(null)

  const handleChange = (field: string, value: string | boolean | number) => {
    setPassData((prev) => ({ ...prev, [field]: value }))
  }
  
  // Función para añadir un nuevo campo personalizado
  const addCustomField = (section: string) => {
    const newField: CustomField = {
      id: `field_${Date.now()}`,
      key: "",
      label: "",
      value: "",
      textAlignment: "natural"
    }
    
    switch(section) {
      case "header":
        setHeaderFields([...headerFields, newField])
        break
      case "primary":
        setPrimaryFields([...primaryFields, newField])
        break
      case "secondary":
        setSecondaryFields([...secondaryFields, newField])
        break
      case "auxiliary":
        setAuxiliaryFields([...auxiliaryFields, newField])
        break
      case "back":
        setBackFields([...backFields, newField])
        break
    }
  }
  
  // Función para actualizar un campo personalizado
  const updateCustomField = (section: string, id: string, field: string, value: string) => {
    const updateField = (fields: CustomField[]) => 
      fields.map(f => f.id === id ? {...f, [field]: value} : f)
    
    switch(section) {
      case "header":
        setHeaderFields(updateField(headerFields))
        break
      case "primary":
        setPrimaryFields(updateField(primaryFields))
        break
      case "secondary":
        setSecondaryFields(updateField(secondaryFields))
        break
      case "auxiliary":
        setAuxiliaryFields(updateField(auxiliaryFields))
        break
      case "back":
        setBackFields(updateField(backFields))
        break
    }
  }
  
  // Función para eliminar un campo personalizado
  const removeCustomField = (section: string, id: string) => {
    const filterFields = (fields: CustomField[]) => 
      fields.filter(f => f.id !== id)
    
    switch(section) {
      case "header":
        setHeaderFields(filterFields(headerFields))
        break
      case "primary":
        setPrimaryFields(filterFields(primaryFields))
        break
      case "secondary":
        setSecondaryFields(filterFields(secondaryFields))
        break
      case "auxiliary":
        setAuxiliaryFields(filterFields(auxiliaryFields))
        break
      case "back":
        setBackFields(filterFields(backFields))
        break
    }
  }
  
  // Renderizado de campos personalizados
  const renderCustomFields = (section: string, fields: CustomField[]) => {
    return (
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="border rounded-md p-4 space-y-3 relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => removeCustomField(section, field.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
            <div className="space-y-2">
              <Label>Campo ID</Label>
              <Input 
                value={field.key} 
                onChange={(e) => updateCustomField(section, field.id, "key", e.target.value)}
                placeholder="identificador_unico"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Etiqueta</Label>
              <Input 
                value={field.label} 
                onChange={(e) => updateCustomField(section, field.id, "label", e.target.value)}
                placeholder="Nombre visible"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input 
                value={field.value} 
                onChange={(e) => updateCustomField(section, field.id, "value", e.target.value)}
                placeholder="Contenido del campo"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Alineación</Label>
              <Select 
                value={field.textAlignment} 
                onValueChange={(value: "left" | "center" | "right" | "natural") => updateCustomField(section, field.id, "textAlignment", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar alineación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Izquierda</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="right">Derecha</SelectItem>
                  <SelectItem value="natural">Automática</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => addCustomField(section)}
        >
          <Plus className="mr-2 h-4 w-4" /> Añadir campo
        </Button>
      </div>
    )
  }

  // Función para verificar el estado de los certificados
  const checkCertificateStatus = async () => {
    try {
      const response = await fetch('/api/passes')
      const data = await response.json()
      setCertificateStatus(data)
    } catch (error) {
      console.error('Error checking certificate status:', error)
      setCertificateStatus({
        valid: false,
        message: 'Error checking certificate status'
      })
    }
  }
  
  // Verificar el estado de los certificados al cargar el componente
  useEffect(() => {
    checkCertificateStatus()
  }, [])
  
  // Función para generar y descargar el pase
  const generateAndDownloadPass = async (installDirectly = false) => {
    try {
      setIsGenerating(true)
      setGenerationError(null)
      
      // Preparar datos del pase según el tipo seleccionado
      const passDataToSend = {
        ...passData,
        barcodeMessage: passData.barcode.message || "Sample Pass",
        barcodeFormat: passData.barcode.format || "QR"
      };

      // Incluir imágenes codificadas en base64 si existen
      if (passData.logoImage) passDataToSend.logoImage = passData.logoImage;
      if (passData.iconImage) passDataToSend.iconImage = passData.iconImage;
      if (passData.stripImage) passDataToSend.stripImage = passData.stripImage;
      if (passData.backgroundImage) passDataToSend.backgroundImage = passData.backgroundImage;
      if (passData.thumbnailImage) passDataToSend.thumbnailImage = passData.thumbnailImage;
      if (passData.footerImage) passDataToSend.footerImage = passData.footerImage;

      // Agregar campos personalizados si existen
      if (backFields.length > 0) {
        passDataToSend.backFields = backFields.map(field => ({
          key: field.key,
          label: field.label,
          value: field.value,
          textAlignment: field.textAlignment || "PKTextAlignmentLeft"
        }));
      }

      console.log("Enviando datos para generar el pase:", { passType, passDataToSend });
      
      // Enviar la solicitud a la API
      const response = await fetch('/api/passes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passType,
          passData: passDataToSend
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to generate pass')
      }
      
      // Obtener el blob del pase
      const passBlob = await response.blob()
      
      if (installDirectly) {
        // Para instalar directamente en Apple Wallet (dispositivos iOS/macOS)
        
        // Crear un objeto URL para el blob con el tipo MIME correcto
        const passObjectURL = URL.createObjectURL(
          new Blob([passBlob], { type: 'application/vnd.apple.pkpass' })
        );
        
        // En dispositivos iOS/macOS, esto abrirá directamente Apple Wallet
        // En otros dispositivos, se descargará el archivo
        window.location.href = passObjectURL;
        
        // Mostrar mensaje informativo para usuarios que no están en iOS/macOS
        if (!(/iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent))) {
          setTimeout(() => {
            alert("Para instalar el pase en Apple Wallet, necesitas usar un dispositivo iOS o macOS. El archivo ha sido descargado en tu dispositivo.");
          }, 1000);
        }
        
        // Limpiar el objeto URL después de un tiempo razonable
        setTimeout(() => {
          URL.revokeObjectURL(passObjectURL);
        }, 5000);
      } else {
        // Para descargar el archivo como .pkpass
        const downloadUrl = URL.createObjectURL(
          new Blob([passBlob], { type: 'application/vnd.apple.pkpass' })
        );
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${passData.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pkpass`;
        document.body.appendChild(a);
        a.click();
      
      // Limpiar
        setTimeout(() => {
          URL.revokeObjectURL(downloadUrl);
          document.body.removeChild(a);
        }, 100);
      }
    } catch (error) {
      console.error('Error generating pass:', error);
      setGenerationError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsGenerating(false);
    }
  }

  // Función para manejar la carga de imágenes
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, imageType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño máximo (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. El tamaño máximo es 5MB');
      return;
    }

    // Convertir la imagen a base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Image = e.target?.result as string;
      
      // Actualizar el estado con la imagen codificada en base64
      setPassData((prev) => ({
        ...prev,
        [imageType]: base64Image
      }));
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <section className="w-full py-12 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Create Your Digital Pass</h2>
          <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
            Customize every aspect of your digital wallet pass
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-6">
              {/* Selector de tipo de pase prominente */}
              <Card className="border-2 border-primary/20">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Tipo de Pase</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${passType === "event" ? "border-primary bg-primary/10" : "border-gray-200 hover:border-primary/50"}`}
                      onClick={() => setPassType("event")}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Boleto de Evento</h4>
                        {passType === "event" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                      </div>
                      <p className="text-xs text-gray-500">Perfecto para conciertos, conferencias y eventos deportivos.</p>
                    </div>
                    
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${passType === "loyalty" ? "border-primary bg-primary/10" : "border-gray-200 hover:border-primary/50"}`}
                      onClick={() => setPassType("loyalty")}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Tarjeta de Fidelidad</h4>
                        {passType === "loyalty" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                      </div>
                      <p className="text-xs text-gray-500">Ideal para programas de puntos y recompensas.</p>
                    </div>
                    
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${passType === "coupon" ? "border-primary bg-primary/10" : "border-gray-200 hover:border-primary/50"}`}
                      onClick={() => setPassType("coupon")}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Cupón</h4>
                        {passType === "coupon" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                      </div>
                      <p className="text-xs text-gray-500">Para descuentos, ofertas y promociones.</p>
                    </div>
                    
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${passType === "boarding" ? "border-primary bg-primary/10" : "border-gray-200 hover:border-primary/50"}`}
                      onClick={() => setPassType("boarding")}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Pase de Embarque</h4>
                        {passType === "boarding" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                      </div>
                      <p className="text-xs text-gray-500">Para aerolíneas, trenes y otros medios de transporte.</p>
                    </div>
                    
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${passType === "storeCard" ? "border-primary bg-primary/10" : "border-gray-200 hover:border-primary/50"}`}
                      onClick={() => setPassType("storeCard")}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Tarjeta de Tienda</h4>
                        {passType === "storeCard" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                      </div>
                      <p className="text-xs text-gray-500">Para tarjetas de regalo, saldo y membresías.</p>
                    </div>
                    
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${passType === "contact" ? "border-primary bg-primary/10" : "border-gray-200 hover:border-primary/50"}`}
                      onClick={() => setPassType("contact")}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Tarjeta de Contacto</h4>
                        {passType === "contact" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                      </div>
                      <p className="text-xs text-gray-500">Comparte tu información de contacto rápidamente.</p>
                    </div>
                    
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${passType === "generic" ? "border-primary bg-primary/10" : "border-gray-200 hover:border-primary/50"}`}
                      onClick={() => setPassType("generic")}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Genérico</h4>
                        {passType === "generic" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                      </div>
                      <p className="text-xs text-gray-500">Formato personalizable para cualquier uso.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            <Tabs defaultValue="design" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="design">Diseño</TabsTrigger>
                <TabsTrigger value="content">Contenido</TabsTrigger>
                <TabsTrigger value="advanced">Avanzado</TabsTrigger>
                <TabsTrigger value="fields">Campos</TabsTrigger>
              </TabsList>

              {/* Pestaña de diseño */}
              <TabsContent value="design" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                        {/* Tipo de pase - ELIMINADO DE AQUÍ Y MOVIDO ARRIBA */}
                    
                    {/* Colores */}
                    <div className="border rounded-md p-4 space-y-4">
                      <h3 className="text-base font-medium">Colores</h3>
                      
                      <div className="space-y-2">
                        <Label>Color Primario</Label>
                        <ColorPicker
                          color={passData.primaryColor}
                          onChange={(color) => handleChange("primaryColor", color)}
                        />
                        <p className="text-xs text-muted-foreground">Color principal del pase</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Color Secundario</Label>
                        <ColorPicker
                          color={passData.secondaryColor}
                          onChange={(color) => handleChange("secondaryColor", color)}
                        />
                        <p className="text-xs text-muted-foreground">Color secundario para acentos</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Color de Fondo</Label>
                        <ColorPicker
                          color={passData.backgroundColor}
                          onChange={(color) => handleChange("backgroundColor", color)}
                        />
                        <p className="text-xs text-muted-foreground">Color de fondo del pase</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Color de Texto</Label>
                        <ColorPicker
                          color={passData.foregroundColor}
                          onChange={(color) => handleChange("foregroundColor", color)}
                        />
                        <p className="text-xs text-muted-foreground">Color principal del texto</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Color de Etiquetas</Label>
                        <ColorPicker
                          color={passData.labelColor}
                          onChange={(color) => handleChange("labelColor", color)}
                        />
                        <p className="text-xs text-muted-foreground">Color para etiquetas descriptivas</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Color del Texto del Logo</Label>
                        <ColorPicker
                          color={passData.logoTextColor}
                          onChange={(color) => handleChange("logoTextColor", color)}
                        />
                        <p className="text-xs text-muted-foreground">Color para el texto junto al logo</p>
                      </div>
                    </div>
                    
                    {/* Imágenes */}
                    <div className="border rounded-md p-4 space-y-4">
                      <h3 className="text-base font-medium">Imágenes</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="logoUpload">Logo (90×90)</Label>
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="logoUpload"
                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                          >
                            <div className="flex flex-col items-center justify-center pt-3 pb-3">
                                  {passData.logoImage ? (
                                    <div className="w-16 h-16 mb-2 rounded-lg overflow-hidden">
                                      <img 
                                        src={passData.logoImage} 
                                        alt="Logo Preview" 
                                        className="w-full h-full object-cover" 
                                      />
                                    </div>
                                  ) : (
                              <Upload className="w-6 h-6 mb-2 text-gray-500 dark:text-gray-400" />
                                  )}
                              <p className="text-xs text-gray-500 dark:text-gray-400">Logo principal</p>
                            </div>
                                <input 
                                  id="logoUpload" 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, 'logoImage')}
                                />
                          </label>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="iconUpload">Icono (29×29)</Label>
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="iconUpload"
                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                          >
                            <div className="flex flex-col items-center justify-center pt-3 pb-3">
                                  {passData.iconImage ? (
                                    <div className="w-16 h-16 mb-2 rounded-lg overflow-hidden">
                                      <img 
                                        src={passData.iconImage} 
                                        alt="Icon Preview" 
                                        className="w-full h-full object-cover" 
                                      />
                                    </div>
                                  ) : (
                              <Upload className="w-6 h-6 mb-2 text-gray-500 dark:text-gray-400" />
                                  )}
                              <p className="text-xs text-gray-500 dark:text-gray-400">Icono para notificaciones</p>
                            </div>
                                <input 
                                  id="iconUpload" 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, 'iconImage')}
                                />
                          </label>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="stripUpload">Imagen Superior (320×84-110)</Label>
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="stripUpload"
                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                          >
                            <div className="flex flex-col items-center justify-center pt-3 pb-3">
                                  {passData.stripImage ? (
                                    <div className="w-20 h-10 mb-2 rounded-lg overflow-hidden">
                                      <img 
                                        src={passData.stripImage} 
                                        alt="Strip Preview" 
                                        className="w-full h-full object-cover" 
                                      />
                                    </div>
                                  ) : (
                              <Upload className="w-6 h-6 mb-2 text-gray-500 dark:text-gray-400" />
                                  )}
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Imagen de la parte superior</p>
                            </div>
                                <input 
                                  id="stripUpload" 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, 'stripImage')}
                                />
                          </label>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="backgroundUpload">Imagen de Fondo (320×480)</Label>
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="backgroundUpload"
                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                          >
                            <div className="flex flex-col items-center justify-center pt-3 pb-3">
                                  {passData.backgroundImage ? (
                                    <div className="w-16 h-20 mb-2 rounded-lg overflow-hidden">
                                      <img 
                                        src={passData.backgroundImage} 
                                        alt="Background Preview" 
                                        className="w-full h-full object-cover" 
                                      />
                                    </div>
                                  ) : (
                              <Upload className="w-6 h-6 mb-2 text-gray-500 dark:text-gray-400" />
                                  )}
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Imagen de fondo</p>
                            </div>
                                <input 
                                  id="backgroundUpload" 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, 'backgroundImage')}
                                />
                          </label>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="thumbnailUpload">Miniatura (90×90)</Label>
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="thumbnailUpload"
                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                          >
                            <div className="flex flex-col items-center justify-center pt-3 pb-3">
                                  {passData.thumbnailImage ? (
                                    <div className="w-16 h-16 mb-2 rounded-lg overflow-hidden">
                                      <img 
                                        src={passData.thumbnailImage} 
                                        alt="Thumbnail Preview" 
                                        className="w-full h-full object-cover" 
                                      />
                                    </div>
                                  ) : (
                              <Upload className="w-6 h-6 mb-2 text-gray-500 dark:text-gray-400" />
                                  )}
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Miniatura central</p>
                            </div>
                                <input 
                                  id="thumbnailUpload" 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, 'thumbnailImage')}
                                />
                          </label>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="footerUpload">Pie de Página (300×16)</Label>
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="footerUpload"
                            className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                          >
                            <div className="flex flex-col items-center justify-center pt-3 pb-3">
                                  {passData.footerImage ? (
                                    <div className="w-24 h-8 mb-2 rounded-lg overflow-hidden">
                                      <img 
                                        src={passData.footerImage} 
                                        alt="Footer Preview" 
                                        className="w-full h-full object-cover" 
                                      />
                                    </div>
                                  ) : (
                              <Upload className="w-6 h-6 mb-2 text-gray-500 dark:text-gray-400" />
                                  )}
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Imagen de pie de página</p>
                            </div>
                                <input 
                                  id="footerUpload" 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, 'footerImage')}
                                />
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Códigos */}
                    <div className="border rounded-md p-4 space-y-4">
                      <h3 className="text-base font-medium">Códigos de Barras/QR</h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="barcode">Incluir Código</Label>
                          <p className="text-xs text-muted-foreground">Añadir un código escaneable al pase</p>
                        </div>
                        <Switch
                          id="barcode"
                              checked={passData.barcode.message !== ""}
                              onCheckedChange={(checked) => {
                                handleChange("barcode.message", checked ? "Executive Engineers Conference" : "");
                                handleChange("barcode.format", checked ? "QR" : "");
                                handleChange("barcode.messageEncoding", checked ? "iso-8859-1" : "");
                              }}
                        />
                      </div>
                      
                          {passData.barcode.message && (
                        <div className="space-y-2">
                          <Label>Formato del Código</Label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <input 
                                type="radio" 
                                  id="QR" 
                                  value="QR" 
                                    checked={passData.barcode.format === "QR"}
                                    onChange={() => handleChange("barcode.format", "QR")}
                                />
                                <Label htmlFor="QR">QR Code</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input 
                                type="radio" 
                                id="pdf417" 
                                value="pdf417" 
                                    checked={passData.barcode.format === "pdf417"}
                                    onChange={() => handleChange("barcode.format", "pdf417")}
                              />
                              <Label htmlFor="pdf417">PDF417</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input 
                                type="radio" 
                                id="aztec" 
                                value="aztec" 
                                    checked={passData.barcode.format === "aztec"}
                                    onChange={() => handleChange("barcode.format", "aztec")}
                              />
                              <Label htmlFor="aztec">Aztec</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input 
                                type="radio" 
                                id="code128" 
                                value="code128" 
                                    checked={passData.barcode.format === "code128"}
                                    onChange={() => handleChange("barcode.format", "code128")}
                              />
                              <Label htmlFor="code128">Code 128</Label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pestaña de contenido */}
              <TabsContent value="content" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={passData.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subtitle">Subtítulo</Label>
                      <Input
                        id="subtitle"
                        value={passData.subtitle}
                        onChange={(e) => handleChange("subtitle", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="organizationName">Nombre de Organización</Label>
                      <Input
                        id="organizationName"
                        value={passData.organizationName}
                        onChange={(e) => handleChange("organizationName", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={passData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="logoText">Texto del Logo</Label>
                            <Input
                              id="logoText"
                              value={passData.logoText}
                              onChange={(e) => handleChange("logoText", e.target.value)}
                              maxLength={4}
                            />
                          </div>
                          
                          {(passType === "event" || passType === "generic" || passType === "coupon") && (
                      <div className="space-y-2">
                        <Label htmlFor="location">Ubicación</Label>
                        <Input
                          id="location"
                          value={passData.location}
                          onChange={(e) => handleChange("location", e.target.value)}
                        />
                      </div>
                          )}
                        </div>

                        {/* Campos específicos según el tipo de pase */}
                        {passType === "event" && (
                          <div className="border rounded-md p-4 space-y-4">
                            <h3 className="text-base font-medium">Detalles del Evento</h3>
                            <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                                <Label htmlFor="date">Fecha</Label>
                        <Input
                                  id="date"
                                  type="date"
                                  value={passData.date}
                                  onChange={(e) => handleChange("date", e.target.value)}
                        />
                      </div>
                              <div className="space-y-2">
                                <Label htmlFor="time">Hora</Label>
                                <Input
                                  id="time"
                                  type="time"
                                  value={passData.time}
                                  onChange={(e) => handleChange("time", e.target.value)}
                                />
                    </div>
                        </div>
                          </div>
                        )}

                        {passType === "loyalty" && (
                          <div className="border rounded-md p-4 space-y-4">
                            <h3 className="text-base font-medium">Detalles de Fidelidad</h3>
                            <div className="space-y-2">
                              <Label htmlFor="membershipNumber">Número de Socio</Label>
                              <Input
                                id="membershipNumber"
                                value={passData.membershipNumber}
                                onChange={(e) => handleChange("membershipNumber", e.target.value)}
                                placeholder="1234567890"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="balance">Saldo de Puntos</Label>
                              <Input
                                id="balance"
                                value={passData.balance}
                                onChange={(e) => handleChange("balance", e.target.value)}
                                placeholder="150 puntos"
                              />
                            </div>
                          </div>
                        )}

                        {passType === "coupon" && (
                          <div className="border rounded-md p-4 space-y-4">
                            <h3 className="text-base font-medium">Detalles del Cupón</h3>
                            <div className="space-y-2">
                              <Label htmlFor="discount">Descuento</Label>
                              <Input
                                id="discount"
                                value={passData.discount}
                                onChange={(e) => handleChange("discount", e.target.value)}
                                placeholder="20% DESCUENTO"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="expirationDate">Fecha de Expiración</Label>
                              <Input
                                id="expirationDate"
                                type="datetime-local"
                                value={passData.expirationDate}
                                onChange={(e) => handleChange("expirationDate", e.target.value)}
                              />
                            </div>
                          </div>
                        )}

                        {passType === "boarding" && (
                          <div className="border rounded-md p-4 space-y-4">
                            <h3 className="text-base font-medium">Detalles de Embarque</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="flightNumber">Número de Vuelo</Label>
                                <Input
                                  id="flightNumber"
                                  value={passData.flightNumber}
                                  onChange={(e) => handleChange("flightNumber", e.target.value)}
                                  placeholder="AB123"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="gate">Puerta</Label>
                                <Input
                                  id="gate"
                                  value={passData.gate}
                                  onChange={(e) => handleChange("gate", e.target.value)}
                                  placeholder="B12"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="seat">Asiento</Label>
                                <Input
                                  id="seat"
                                  value={passData.seat}
                                  onChange={(e) => handleChange("seat", e.target.value)}
                                  placeholder="23A"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="boardingTime">Hora de Embarque</Label>
                                <Input
                                  id="boardingTime"
                                  value={passData.boardingTime}
                                  onChange={(e) => handleChange("boardingTime", e.target.value)}
                                  placeholder="11:30"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="date">Fecha de Vuelo</Label>
                              <Input
                                id="date"
                                type="date"
                                value={passData.date}
                                onChange={(e) => handleChange("date", e.target.value)}
                              />
                            </div>
                          </div>
                        )}

                        {passType === "storeCard" && (
                          <div className="border rounded-md p-4 space-y-4">
                            <h3 className="text-base font-medium">Detalles de Tarjeta</h3>
                            <div className="space-y-2">
                              <Label htmlFor="membershipNumber">Número de Tarjeta</Label>
                              <Input
                                id="membershipNumber"
                                value={passData.membershipNumber}
                                onChange={(e) => handleChange("membershipNumber", e.target.value)}
                                placeholder="1234-5678-9012"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="balance">Saldo</Label>
                              <Input
                                id="balance"
                                value={passData.balance}
                                onChange={(e) => handleChange("balance", e.target.value)}
                                placeholder="50,00 €"
                              />
                            </div>
                          </div>
                        )}

                        {passType === "contact" && (
                          <div className="border rounded-md p-4 space-y-4">
                            <h3 className="text-base font-medium">Información de Contacto</h3>
                            <div className="space-y-2">
                              <Label htmlFor="contactName">Nombre Completo</Label>
                              <Input
                                id="contactName"
                                value={passData.contactName}
                                onChange={(e) => handleChange("contactName", e.target.value)}
                                placeholder="Juan Pérez"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="contactJob">Cargo</Label>
                              <Input
                                id="contactJob"
                                value={passData.contactJob}
                                onChange={(e) => handleChange("contactJob", e.target.value)}
                                placeholder="Director de Marketing"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="contactCompany">Empresa</Label>
                              <Input
                                id="contactCompany"
                                value={passData.contactCompany}
                                onChange={(e) => handleChange("contactCompany", e.target.value)}
                                placeholder="Empresa S.A."
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="contactPhone">Teléfono</Label>
                                <Input
                                  id="contactPhone"
                                  value={passData.contactPhone}
                                  onChange={(e) => handleChange("contactPhone", e.target.value)}
                                  placeholder="+34 600 000 000"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="contactEmail">Email</Label>
                                <Input
                                  id="contactEmail"
                                  value={passData.contactEmail}
                                  onChange={(e) => handleChange("contactEmail", e.target.value)}
                                  placeholder="ejemplo@email.com"
                                  type="email"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="contactWebsite">Sitio Web</Label>
                              <Input
                                id="contactWebsite"
                                value={passData.contactWebsite}
                                onChange={(e) => handleChange("contactWebsite", e.target.value)}
                                placeholder="https://www.ejemplo.com"
                                type="url"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="contactAddress">Dirección</Label>
                              <Textarea
                                id="contactAddress"
                                value={passData.contactAddress}
                                onChange={(e) => handleChange("contactAddress", e.target.value)}
                                placeholder="Calle Ejemplo 123, 28001 Madrid, España"
                                rows={2}
                              />
                            </div>
                          </div>
                        )}

                        {passType === "generic" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Fecha</Label>
                        <Input
                          id="date"
                          type="date"
                          value={passData.date}
                          onChange={(e) => handleChange("date", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Hora</Label>
                        <Input
                          id="time"
                          type="time"
                          value={passData.time}
                          onChange={(e) => handleChange("time", e.target.value)}
                        />
                            </div>
                          </div>
                        )}
                        
                        <div className="border rounded-md p-4 space-y-4">
                          <h3 className="text-base font-medium">Fechas Importantes</h3>
                          <div className="space-y-2">
                            <Label htmlFor="relevantDate">Fecha Relevante</Label>
                            <Input
                              id="relevantDate"
                              type="datetime-local"
                              value={passData.relevantDate}
                              onChange={(e) => handleChange("relevantDate", e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Cuándo el pase será relevante para mostrar</p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="expirationDate">Fecha de Expiración</Label>
                            <Input
                              id="expirationDate"
                              type="datetime-local"
                              value={passData.expirationDate}
                              onChange={(e) => handleChange("expirationDate", e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Cuándo el pase expirará</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Pestaña de opciones avanzadas */}
              <TabsContent value="advanced" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateStyle">Estilo de Fecha</Label>
                      <Select 
                        value={passData.dateStyle} 
                        onValueChange={(value) => handleChange("dateStyle", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estilo de fecha" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Ninguno</SelectItem>
                          <SelectItem value="short">Corto (01/01/2023)</SelectItem>
                          <SelectItem value="medium">Medio (1 Ene 2023)</SelectItem>
                          <SelectItem value="long">Largo (1 de Enero de 2023)</SelectItem>
                          <SelectItem value="full">Completo (Lunes, 1 de Enero de 2023)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timeStyle">Estilo de Hora</Label>
                      <Select 
                        value={passData.timeStyle} 
                        onValueChange={(value) => handleChange("timeStyle", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estilo de hora" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Ninguno</SelectItem>
                          <SelectItem value="short">Corto (9:00)</SelectItem>
                          <SelectItem value="medium">Medio (9:00 AM)</SelectItem>
                          <SelectItem value="long">Largo (9:00:00 AM GMT+1)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="relevantDate">Fecha Relevante</Label>
                      <Input
                        id="relevantDate"
                        type="datetime-local"
                        value={passData.relevantDate}
                        onChange={(e) => handleChange("relevantDate", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Cuándo el pase será relevante para mostrar en el dispositivo</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="expirationDate">Fecha de Expiración</Label>
                      <Input
                        id="expirationDate"
                        type="datetime-local"
                        value={passData.expirationDate}
                        onChange={(e) => handleChange("expirationDate", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Cuándo el pase expirará y se marcará como obsoleto</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="voided">Pase Anulado</Label>
                        <p className="text-xs text-muted-foreground">Marca el pase como no válido</p>
                      </div>
                      <Switch
                        id="voided"
                        checked={passData.voided}
                        onCheckedChange={(checked) => handleChange("voided", checked)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Alineación de Texto</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="headerAlignment" className="text-xs">Cabecera</Label>
                          <Select 
                            value={passData.headerAlignment} 
                            onValueChange={(value) => handleChange("headerAlignment", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Alineación" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Izquierda</SelectItem>
                              <SelectItem value="center">Centro</SelectItem>
                              <SelectItem value="right">Derecha</SelectItem>
                              <SelectItem value="natural">Automática</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="primaryAlignment" className="text-xs">Campos Primarios</Label>
                          <Select 
                            value={passData.primaryAlignment} 
                            onValueChange={(value) => handleChange("primaryAlignment", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Alineación" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Izquierda</SelectItem>
                              <SelectItem value="center">Centro</SelectItem>
                              <SelectItem value="right">Derecha</SelectItem>
                              <SelectItem value="natural">Automática</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="showReverse">Mostrar Reverso</Label>
                        <p className="text-xs text-muted-foreground">Habilitar campos en el reverso del pase</p>
                      </div>
                      <Switch
                        id="showReverse"
                        checked={passData.showReverse}
                        onCheckedChange={(checked) => handleChange("showReverse", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="useAdvancedEditor">Usar Editor Avanzado</Label>
                        <p className="text-xs text-muted-foreground">Habilitar la edición avanzada del pase</p>
                      </div>
                      <Switch
                        id="useAdvancedEditor"
                        checked={passData.useAdvancedEditor}
                            onCheckedChange={(checked) => {
                              handleChange("useAdvancedEditor", checked);
                              // Si desactivamos el editor avanzado, también desactivamos personalización completa
                              if (!checked) {
                                handleChange("allowFullCustomization", false);
                              }
                            }}
                      />
                    </div>
                    
                    {passData.useAdvancedEditor && (
                      <AdvancedPassEditor 
                        backgroundColor={passData.backgroundColor}
                        width={passData.customWidth} 
                        height={passData.customHeight} 
                        elements={freeElements} 
                        setElements={setFreeElements}
                        selectedElement={selectedElement} 
                        setSelectedElement={setSelectedElement} 
                      />
                    )}
                    
                    <div className="space-y-2">
                      <Label>Ancho Personalizado</Label>
                      <Input 
                        type="number" 
                        value={passData.customWidth} 
                        onChange={(e) => handleChange("customWidth", Number(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Altura Personalizada</Label>
                      <Input 
                        type="number" 
                        value={passData.customHeight} 
                        onChange={(e) => handleChange("customHeight", Number(e.target.value))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="allowCustomDimensions">Permitir Dimensiones Personalizadas</Label>
                        <p className="text-xs text-muted-foreground">Permitir al usuario cambiar el tamaño del pase</p>
                      </div>
                      <Switch
                        id="allowCustomDimensions"
                        checked={passData.allowCustomDimensions}
                        onCheckedChange={(checked) => handleChange("allowCustomDimensions", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="customPassType">Tipo de Pase Personalizado</Label>
                        <p className="text-xs text-muted-foreground">Permitir al usuario seleccionar un tipo de pase personalizado</p>
                      </div>
                      <Switch
                        id="customPassType"
                        checked={passData.customPassType}
                        onCheckedChange={(checked) => handleChange("customPassType", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="allowFullCustomization">Permitir Personalización Completa</Label>
                        <p className="text-xs text-muted-foreground">Permitir al usuario personalizar completamente el pase</p>
                      </div>
                      <Switch
                        id="allowFullCustomization"
                        checked={passData.allowFullCustomization}
                            onCheckedChange={(checked) => {
                              // Si se activa la personalización completa, también activar el editor avanzado
                              if (checked) {
                                handleChange("useAdvancedEditor", true);
                              }
                              handleChange("allowFullCustomization", checked);
                            }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Pestaña de campos personalizados */}
              <TabsContent value="fields" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-6">
                      <div className="border rounded-md p-4">
                        <h3 className="text-base font-medium mb-4">Campos de Cabecera</h3>
                        {renderCustomFields("header", headerFields)}
                      </div>
                      
                      <div className="border rounded-md p-4">
                        <h3 className="text-base font-medium mb-4">Campos Primarios</h3>
                        {renderCustomFields("primary", primaryFields)}
                      </div>
                      
                      <div className="border rounded-md p-4">
                        <h3 className="text-base font-medium mb-4">Campos Secundarios</h3>
                        {renderCustomFields("secondary", secondaryFields)}
                      </div>
                      
                      <div className="border rounded-md p-4">
                        <h3 className="text-base font-medium mb-4">Campos Auxiliares</h3>
                        {renderCustomFields("auxiliary", auxiliaryFields)}
                      </div>
                      
                      {passData.showReverse && (
                        <div className="border rounded-md p-4">
                          <h3 className="text-base font-medium mb-4">Campos de Reverso</h3>
                          {renderCustomFields("back", backFields)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex flex-col gap-4">
              {certificateStatus && (
                <div className={`p-4 rounded-md ${certificateStatus.valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <p className="text-sm font-medium">
                    {certificateStatus.valid ? '✅ Certificados de Apple Developer verificados' : `❌ ${certificateStatus.message}`}
                  </p>
                </div>
              )}
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                    onClick={() => generateAndDownloadPass(false)} 
                disabled={isGenerating || (certificateStatus ? !certificateStatus.valid : false)}
                className="w-full"
              >
                {isGenerating ? 'Generando...' : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                        Descargar (.pkpass)
                  </>
                )}
              </Button>
              
                  <Button 
                    onClick={() => generateAndDownloadPass(true)} 
                    disabled={isGenerating || (certificateStatus ? !certificateStatus.valid : false)}
                    className="w-full"
                    variant="outline"
                  >
                    {isGenerating ? 'Generando...' : (
                      <>
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 17.25C9 18.7688 10.2312 20 11.75 20H12.25C13.7688 20 15 18.7688 15 17.25V6.75C15 5.23122 13.7688 4 12.25 4H11.75C10.2312 4 9 5.23122 9 6.75V17.25Z" fill="currentColor"/>
                          <path d="M4.5 13C4.5 14.3807 5.61929 15.5 7 15.5C8.38071 15.5 9.5 14.3807 9.5 13V11C9.5 9.61929 8.38071 8.5 7 8.5C5.61929 8.5 4.5 9.61929 4.5 11V13Z" fill="currentColor"/>
                          <path d="M14.5 11C14.5 9.61929 15.6193 8.5 17 8.5C18.3807 8.5 19.5 9.61929 19.5 11V13C19.5 14.3807 18.3807 15.5 17 15.5C15.6193 15.5 14.5 14.3807 14.5 13V11Z" fill="currentColor"/>
                        </svg>
                        Instalar en Wallet
                      </>
                    )}
                  </Button>
                </div>
                
                {generationError && (
                  <div className="p-4 rounded-md bg-red-100 text-red-800">
                    <p className="text-sm font-medium">Error: {generationError}</p>
                        </div>
                      )}
                            </div>
                            </div>
                          </div>
                          
          <div className="hidden md:block">
            <div className="sticky top-24 w-full">
              <h3 className="text-xl font-semibold mb-6 text-center">Vista Previa del Pase</h3>
              {passData.useAdvancedEditor ? (
                <div className="space-y-4 w-full">
                  <AdvancedPassEditor 
                    backgroundColor={passData.backgroundColor}
                    width={passData.customWidth} 
                    height={passData.customHeight} 
                    elements={freeElements} 
                    setElements={setFreeElements}
                    selectedElement={selectedElement} 
                    setSelectedElement={setSelectedElement} 
                              />
                            </div>
              ) : (
                <PassPreview passType={passType} passData={passData} />
              )}
                          </div>
                          </div>
                        </div>
                          
        {/* Vista previa móvil - solo visible en pantallas pequeñas */}
        <div className="mt-8 md:hidden">
          <h3 className="text-xl font-semibold mb-6 text-center">Vista Previa del Pase</h3>
          {passData.useAdvancedEditor ? (
            <div className="space-y-4 w-full">
              <AdvancedPassEditor 
                backgroundColor={passData.backgroundColor}
                width={passData.customWidth} 
                height={passData.customHeight} 
                elements={freeElements} 
                setElements={setFreeElements}
                selectedElement={selectedElement} 
                setSelectedElement={setSelectedElement} 
              />
              </div>
            ) : (
              <PassPreview passType={passType} passData={passData} />
            )}
        </div>
      </div>
    </section>
  )
}

